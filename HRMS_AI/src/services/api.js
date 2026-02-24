import axios from 'axios'
import dummyUploadData from '../data/dummyUploadData';
import { testData } from '../data/Upload_data_response';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;


export async function searchAPI(query) {
    const response = await fetch(`${BASE_URL}/search-rank-simplified-new`, 
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
  //   return new Promise((resolve) => {
  //   const response ={
  //     employee : testData.all_employees
  //   }
  //   setTimeout(() => {
  //     resolve(response);
  //   }, 1000);
  // });
  }


export async function uploadAPI(formData) {
  try{
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
  } catch (error) {
    console.log(error);
    console.log("Backend not available. Using dummy data.");
    return dummyUploadData; 
  }
  
  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve(dummyUploadData);
  //   }, 1000);
  // });
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

export async function getEmployeesPaginated(page, pageSize) {
  try {
    const response = await axios.get(`${BASE_URL}/employees?page=${page}&page_size=${pageSize}`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.log(error);
  }
  // return new Promise((resolve) => {
  //   const response ={
  //     total_employees : testData.all_employees
  //   }
  //   setTimeout(() => {
  //     resolve(response);
  //   }, 1000);
  // });
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