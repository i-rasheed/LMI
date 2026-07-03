import { FlagReason } from '@lmi/shared';
import { apiRequest } from '../lib/api';
import { FlagSubmissionResult } from '../types/flags';

export function flagPriceSubmission(
  submissionId: string,
  payload: { reason: FlagReason; comment?: string },
): Promise<FlagSubmissionResult> {
  return apiRequest<FlagSubmissionResult>(`/prices/${submissionId}/flag`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
