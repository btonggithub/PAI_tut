jest.mock('../../src/services/auth/authService', () => ({
  getAuthUser: jest.fn(),
}));

jest.mock('../../src/repositories/file/fileRepository', () => ({
  createFileMetadata: jest.fn(),
  findFileById: jest.fn(),
  findFilesByOwner: jest.fn(),
  updateFileStatus: jest.fn(),
}));

jest.mock('../../src/services/file/storage/storageService', () => ({
  storeFile: jest.fn().mockResolvedValue({
    storageKey: 'mock-uuid.txt',
    storedName: 'mock-uuid.txt',
    storageProvider: 'local',
  }),
  removeFile: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/services/audit/auditLogService', () => ({
  recordAuditEvent: jest.fn().mockResolvedValue({}),
}));

const request = require('supertest');
const app = require('../../src/app');
const { toAuthHeader } = require('../helpers/authHeader');
const { signAccessToken } = require('../../src/utils/jwt');
const authService = require('../../src/services/auth/authService');
const fileRepository = require('../../src/repositories/file/fileRepository');
const { recordAuditEvent } = require('../../src/services/audit/auditLogService');

const regularUser = {
  id: '64b7f5b9f1d2c3a4b5c6d7b2',
  name: 'Regular User',
  email: 'user@example.com',
  role: 'user',
};

const otherUser = {
  id: '64b7f5b9f1d2c3a4b5c6d7c3',
  name: 'Other User',
  email: 'other@example.com',
  role: 'user',
};

const accessHeaderFor = (userId) => toAuthHeader(signAccessToken({ sub: userId }));

const mockFileRecord = {
  _id: '64b7f5b9f1d2c3a4b5c6d7f1',
  ownerId: regularUser.id,
  originalName: 'test.txt',
  storedName: 'mock-uuid.txt',
  mimeType: 'text/plain',
  size: 512,
  extension: 'txt',
  storageKey: 'mock-uuid.txt',
  storageProvider: 'local',
  status: 'active',
  metadata: {},
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('File API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authService.getAuthUser.mockResolvedValue(regularUser);
  });

  describe('POST /api/v1/files', () => {
    it('requires authentication', async () => {
      const response = await request(app)
        .post('/api/v1/files')
        .attach('file', Buffer.from('test content'), {
          filename: 'test.txt',
          contentType: 'text/plain',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error');
    });

    it('rejects disallowed MIME type', async () => {
      const response = await request(app)
        .post('/api/v1/files')
        .set(accessHeaderFor(regularUser.id))
        .attach('file', Buffer.from('binary content'), {
          filename: 'malware.exe',
          contentType: 'application/octet-stream',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('rejects request with no file attached', async () => {
      const response = await request(app)
        .post('/api/v1/files')
        .set(accessHeaderFor(regularUser.id))
        .set('Content-Type', 'multipart/form-data');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('creates file metadata for authenticated user', async () => {
      fileRepository.createFileMetadata.mockResolvedValue(mockFileRecord);

      const response = await request(app)
        .post('/api/v1/files')
        .set(accessHeaderFor(regularUser.id))
        .attach('file', Buffer.from('hello world'), {
          filename: 'hello.txt',
          contentType: 'text/plain',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('file');
      expect(response.body.data.file).not.toHaveProperty('storageKey');
      expect(response.body.data.file).not.toHaveProperty('storedName');
    });

    it('assigns ownerId from authenticated user, not request body', async () => {
      fileRepository.createFileMetadata.mockResolvedValue(mockFileRecord);

      await request(app)
        .post('/api/v1/files')
        .set(accessHeaderFor(regularUser.id))
        .attach('file', Buffer.from('hello world'), {
          filename: 'hello.txt',
          contentType: 'text/plain',
        });

      expect(fileRepository.createFileMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: regularUser.id })
      );
    });

    it('records file upload audit event on success', async () => {
      fileRepository.createFileMetadata.mockResolvedValue(mockFileRecord);

      await request(app)
        .post('/api/v1/files')
        .set(accessHeaderFor(regularUser.id))
        .attach('file', Buffer.from('hello world'), {
          filename: 'hello.txt',
          contentType: 'text/plain',
        });

      expect(recordAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'file.upload',
          result: 'succeeded',
          actorId: regularUser.id,
        })
      );
    });
  });

  describe('GET /api/v1/files', () => {
    it('requires authentication', async () => {
      const response = await request(app).get('/api/v1/files');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    it('returns actor-owned files for authenticated user', async () => {
      fileRepository.findFilesByOwner.mockResolvedValue({
        items: [mockFileRecord],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const response = await request(app)
        .get('/api/v1/files')
        .set(accessHeaderFor(regularUser.id));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('files');
      expect(response.body.data).toHaveProperty('meta');
      expect(fileRepository.findFilesByOwner).toHaveBeenCalledWith(
        regularUser.id,
        expect.any(Object)
      );
    });

    it('records file list audit event', async () => {
      fileRepository.findFilesByOwner.mockResolvedValue({
        items: [mockFileRecord],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      await request(app)
        .get('/api/v1/files')
        .set(accessHeaderFor(regularUser.id));

      expect(recordAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'file.list',
          result: 'succeeded',
          actorId: regularUser.id,
        })
      );
    });
  });

  describe('GET /api/v1/files/:id', () => {
    it('requires authentication', async () => {
      const response = await request(app).get('/api/v1/files/64b7f5b9f1d2c3a4b5c6d7f1');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('returns file metadata when actor owns the file', async () => {
      fileRepository.findFileById.mockResolvedValue(mockFileRecord);

      const response = await request(app)
        .get('/api/v1/files/64b7f5b9f1d2c3a4b5c6d7f1')
        .set(accessHeaderFor(regularUser.id));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('file');
      expect(response.body.data.file).not.toHaveProperty('storageKey');
    });

    it('records successful file view audit event', async () => {
      fileRepository.findFileById.mockResolvedValue(mockFileRecord);

      await request(app)
        .get('/api/v1/files/64b7f5b9f1d2c3a4b5c6d7f1')
        .set(accessHeaderFor(regularUser.id));

      expect(recordAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'file.view',
          result: 'succeeded',
          actorId: regularUser.id,
        })
      );
    });

    it('returns 403 when actor does not own the file', async () => {
      const otherOwnerFile = { ...mockFileRecord, ownerId: otherUser.id };
      fileRepository.findFileById.mockResolvedValue(otherOwnerFile);

      const response = await request(app)
        .get('/api/v1/files/64b7f5b9f1d2c3a4b5c6d7f1')
        .set(accessHeaderFor(regularUser.id));

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('records forbidden file view audit event on ownership failure', async () => {
      const otherOwnerFile = { ...mockFileRecord, ownerId: otherUser.id };
      fileRepository.findFileById.mockResolvedValue(otherOwnerFile);

      await request(app)
        .get('/api/v1/files/64b7f5b9f1d2c3a4b5c6d7f1')
        .set(accessHeaderFor(regularUser.id));

      expect(recordAuditEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'file.view',
          result: 'forbidden',
          actorId: regularUser.id,
        })
      );
    });

    it('returns 404 when file is not found', async () => {
      fileRepository.findFileById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/files/64b7f5b9f1d2c3a4b5c6d7f1')
        .set(accessHeaderFor(regularUser.id));

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
