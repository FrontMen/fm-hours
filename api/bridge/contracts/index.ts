import {VercelRequest, VercelResponse} from '@vercel/node';
import axios from 'axios';

export default function Contracts(request: VercelRequest, response: VercelResponse) {
  const {contractId, jiraId, projectId, projectJiraId, projectKey, search} = request.query;

  return axios
    .get(`https://bridge.hosted-tools.com/api/v1/contracts`, {
      params: {
        id: contractId,
        jira_id: jiraId,
        project_id: projectId,
        project_jira_id: projectJiraId,
        project_key: projectKey,
        search,
      },
      headers: {
        Cookie: request.headers.cookie || '',
      },
    })
    .then(res => response.json(res.data))
    .catch(err => response.json(err));
}
