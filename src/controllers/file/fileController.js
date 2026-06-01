const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/response');
const fileService = require('../../services/file/fileService');

const uploadFile = asyncHandler(async (req, res) => {
  const file = await fileService.createUserFile({
    actor: req.user,
    file: req.file,
    metadata: {},
  });
  return sendSuccess(res, { file }, 201, 'File uploaded successfully');
});

const listFiles = asyncHandler(async (req, res) => {
  const data = await fileService.listUserFiles({ actor: req.user, query: req.query });
  return sendSuccess(res, data);
});

const getFile = asyncHandler(async (req, res) => {
  const file = await fileService.getUserFile({ actor: req.user, fileId: req.params.id });
  return sendSuccess(res, { file });
});

module.exports = {
  uploadFile,
  listFiles,
  getFile,
};
