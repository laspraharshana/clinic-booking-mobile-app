import type { Response, NextFunction } from 'express';
import type { AuthedRequest } from '../middleware/auth.js';
import { getReportData } from '../services/admin.reports.service.js';

// GET /v1/admin/reports?period=Week|Month|Year
export async function getReportsCtrl(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const period = (req.query.period as string) || 'Week';
    const data = await getReportData(period);
    res.status(200).json(data);
  } catch (e) {
    next(e);
  }
}
