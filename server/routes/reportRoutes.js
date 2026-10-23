import express from 'express';
import {
  getReport,
  generateReportHandler,
  saveReport,
  exportMarkdown,
  exportJson,
} from '../controllers/reportController.js';

const router = express.Router({ mergeParams: true });

router.get('/', getReport);
router.post('/', generateReportHandler);
router.put('/', saveReport);
router.get('/export/markdown', exportMarkdown);
router.get('/export/json', exportJson);

export default router;
