## architecture.md
- Endpoint: POST /api/files
- Flow:
  Client -> Controller -> Service -> Storage
- Storage Options:
  - Local filesystem (uploads/)
  - Cloud Storage (AWS S3, GCP Storage)
- Middleware: multer for multipart/form-data handling
- Validation & Security:
  - File size limit (5MB)
  - Allowed types: .jpg, .png, .pdf
  - Sanitize file names to prevent path traversal

## coding-rules.md
- Node.js + Express for REST API
- Use multer middleware for file uploads
- Validate file type/size before saving
- Sanitize file names
- Response:
  {
    "success": true,
    "fileId": "<generated-id>",
    "message": "Uploaded successfully"
  }
- Example snippet:
const multer = require('multer');
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

app.post('/api/files', upload.single('file'), (req, res) => {
  res.json({ success: true, fileId: req.file.filename });
});

## conventions.md
- Endpoint Naming: POST /api/files, GET /api/files/:id, DELETE /api/files/:id
- Error Response: { success: false, message: "Error message" }
- Logging: log upload attempts, success, errors
- Directory: 'uploads/' folder or cloud equivalent

## review-checklist.md
- Endpoint POST /api/files exists and returns correct response
- File size and type validation works
- Errors handled correctly
- Security check: path traversal / filename sanitization
- Files stored correctly
- Proper logging implemented
- Unit & integration tests for File Upload implemented

## decisions.md
- Storage: Local filesystem or S3 cloud storage
- Node.js Package: multer
- Max File Size: 5MB
- Allowed File Types: .jpg, .png, .pdf
- File Naming: UUID or timestamp-based sanitized names

## progress.md
- Status: In progress
- REST API foundation for file uploads implemented
- Next Steps: validation, storage handling, unit tests

## prompts/current-task.md
1. Design API endpoint POST /api/files
2. Implement Controller + Service
3. Configure multer middleware
4. Implement file type/size validation
5. Implement storage handling (local/S3)
6. Write unit & integration tests
7. Update documentation, checklist, coding rules

## archive/road-map.md
- Phase 20: File Upload Foundation
- Implement Node.js REST API for file uploads
- Add storage handling, validation, security, error handling
- Update review checklist and coding rules

