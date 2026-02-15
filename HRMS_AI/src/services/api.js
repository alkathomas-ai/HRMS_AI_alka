import axios from 'axios'
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = 'http://localhost:8000'


export async function searchAPI(query) {
    const response = await fetch(`${BASE_URL}/search-rank`, 
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query : query }),
    });
     
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
     return response.json();
  }


export async function uploadAPI(formData) {
  console.log(formData)
  const response = await fetch(`${BASE_URL}/upload/hrms-data`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      return response.json();
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
    const response = await axios.get(`${BASE_URL}/available_employees?month_threshold=9`);
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

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}