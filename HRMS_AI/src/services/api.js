import axios from 'axios'
import { websocketService } from './websocket';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

let sessionExpiredCallback = null;

export const setSessionExpiredCallback = (callback) => {
  sessionExpiredCallback = callback;
};

// Add token to all axios requests
axios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('authToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 responses (session expired)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      websocketService.disconnect();
      sessionStorage.removeItem('authToken');
      if (sessionExpiredCallback) {
        sessionExpiredCallback();
      }
    }
    return Promise.reject(error);
  }
);


export async function searchAPI(query) {
    const token = sessionStorage.getItem('authToken');
    const response = await fetch(`${BASE_URL}/search-rank-simplified-new`, 
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ query : query }),
    });
     
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
     return response.json();
  }


export async function uploadAPI(formData) {
  try{
    console.log(formData)
    const token = sessionStorage.getItem('authToken');
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/upload/hrms-data`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      return response.json();
  } catch (error) {
    console.log(error);
    console.log("Backend not available. Using dummy data.");
    throw error; 
  }
}

export async function getProjectDistributions() {
  try {
const response = await  axios.get(`${BASE_URL}/dashboard/project_distribution`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getEmployeeDirectory() {
  try {
    const response = await axios.get(`${BASE_URL}/dashboard/employee_directory`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}
export async function getDepartment() {
  try {
    const response = await axios.get(`${BASE_URL}/dashboard/department_counts`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getEmployeeCount() {
  try {
    const response = await axios.get(`${BASE_URL}/dashboard/count_data`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}


export async function getSoonAvailableEmployees() {
  try {
    const response = await axios.get(`${BASE_URL}/available_employees?month_threshold=3`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getLowOccupancyEmployees(occupancy, long_term_threshold) {
    try {
    const response = await axios.get(`${BASE_URL}/low_occupancy_employees?occupancy_threshold=${occupancy}&long_term_extension_months
=${long_term_threshold}`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getFreepoolProjectSuggestions() {
  try {
    const response = await axios.get(`${BASE_URL}/freepool_suggestions`);
    console.log(response.data.response[0])
    return response.data.response[0] || [];
  }
  catch (error) {
    console.log(error)
  }
}

export async function getEmployeeDetails(employeeId) {
  try {
    const stripedId = employeeId.slice(5)
    const response = await axios.get(`${BASE_URL}/employees/${stripedId}`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getEmployeesPaginated(page, pageSize) {
  try {
    const response = await axios.get(`${BASE_URL}/employees?page=${page}&page_size=${pageSize}`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function generateWidgetFromPrompt(payload) {
  try {
    console.log(payload)
    const response = await axios.post(`${BASE_URL}/ai-analytics`, {
      "prompt": payload.prompt,
      "chartType": payload.chartType
    });

    if (response.data.status === 'error') {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Failed to generate widget');
  }
}

export async function generateStatsFromPrompt(payload) {
  try {
    console.log(payload)
    const response = await axios.post(`${BASE_URL}/ai-stats`, {
      "prompt": payload.prompt,
      "chartType": payload.chartType || "card"
    });

    if (response.data.status === 'error') {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Failed to generate stats');
  }
}


export async function updateEmployeeSkills(employeeId, skills) {
  try {
    const cleanId = employeeId.replace('VVDN/', '');
    const response = await axios.put(`${BASE_URL}/employees/${cleanId}/skills`, {
      skills: skills
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export async function getProjects() {
  try {
    const response = await axios.get(`${BASE_URL}/projects`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getProjectRequirements() {
  try {
    const response = await axios.get(`${BASE_URL}/project_requirements`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function addProjectRequirement(data) {
  try {
    const response = await axios.post(`${BASE_URL}/project_requirements`, data);
    // if(response.status === 200){
    //   const responseFinal = await updateResourceSuggestion(data.id);
    //   return responseFinal.data;
    // }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function editProjectRequirement(id, data) {
  try {
    const response = await axios.put(`${BASE_URL}/project_requirements/${id}`, data);
    // if(response.status === 200){
    //   const responseFinal = await updateResourceSuggestion(data.id);
    //   return responseFinal.data;
    // }
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteProjectRequirement(id) {
  try {
    const response = await axios.delete(`${BASE_URL}/project_requirements/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function generateResourceSuggestion(id) {
  try {
    const response = await axios.get(`${BASE_URL}/project_requirement_suggestion?project_requirement_id=${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function showResourceSuggestion(id) {
  try {
    const response = await axios.get(`${BASE_URL}/suggested_requirements?project_requirement_id=${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// http://172.25.247.7:8000/api/project_requirement_suggestion?project_requirement_id=2

export async function loginApi(credentials) {
  const response = await axios.post(`${BASE_URL}/login`, credentials);
  return response.data;
}

export async function getAllNotifications() {
  try {
    const response = await axios.get(`${BASE_URL}/notification/get_all_notifications`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function markAsReadNotifications(ids) {
  try {
    const response = await axios.patch(`${BASE_URL}/notification/mark_as_read`, { ids });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function markAsUnreadNotifications(ids) {
  try {
    const response = await axios.patch(`${BASE_URL}/notification/mark_as_unread`, { ids });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function deleteNotifications(ids) {
  try {
    const response = await axios.delete(`${BASE_URL}/notification/delete`, { data: { ids } });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getNotificationCount() {
  try {
    const response = await axios.get(`${BASE_URL}/notification/count`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
