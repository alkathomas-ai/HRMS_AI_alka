import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './EditUser.css'

const EditUser= () => {

  const [data, setData] = useState([]);


 const fetchApi =async () => {
  try {
  const response = await axios.get("https://dummyjson.com/users")
   setData(response.data.users)
  } catch (error) {
    console.log(error)
  }
 }

 console.log(data);
 

 useEffect(()=> {
    fetchApi()
  }, [])

  
  return (
    <div>
      {data.map((item)=> {
        return (
          <div className="">
            <span>{item.firstName}</span>
            <span>{item.lastName}</span>
          </div>
        )
      })}
    </div>
  )
}

export default EditUser
