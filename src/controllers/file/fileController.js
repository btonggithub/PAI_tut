const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const fileService = require('../../services/file/fileService');
const { extractRequestContext } = require('../../utils/requestContext');

const uploadFile = asyncHandler(async (req, res) => {
  const requestContext = extractRequestContext(req);
  const file = await fileService.createUserFile({
    actor: req.user,
    file: req.file,
    metadata: {},
    requestContext,
  });
  return sendSuccess(res, { file }, 201, 'File uploaded successfully');
});

const listFiles = asyncHandler(async (req, res) => {
  const requestContext = extractRequestContext(req);
  const data = await fileService.listUserFiles({ actor: req.user, query: req.query, requestContext });
  return sendSuccess(res, data);
});

const getFile = asyncHandler(async (req, res) => {
  const requestContext = extractRequestContext(req);
  const file = await fileService.getUserFile({ actor: req.user, fileId: req.params.id, requestContext });
  return sendSuccess(res, { file });
});

module.exports = {
  uploadFile,
  listFiles,
  getFile,
};
