import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './EditUser.css'
import { Icons } from '../../assets/icons'

const EditUser= () => {

//   const [data, setData] = useState([]);


//  const fetchApi =async () => {
//   try {
//   const response = await axios.get("https://dummyjson.com/users")
//    setData(response.data.users)
//   } catch (error) {
//     console.log(error)
//   }
//  }

//  console.log(data);
 

//  useEffect(()=> {
//     fetchApi()
//   }, [])

  const editUser = () => {
    console.log("edit user");
  }
  
  return (
    <>
      {/* {data.map((item)=> {
        return (
          <div className="">
            <span>{item.firstName}</span>
            <span>{item.lastName}</span>
          </div>
        )
      })} */}


      <div className='edit-user-header'>
        <div className='edit-user-btns'>
          <button className="update-btn btn-primary" onClick={()=> {}}>
            <span><img src={Icons.pencil} alt="" /></span>
            Update Skills
          </button>
  
          <button className="edit-btn btn-primary" onClick={editUser()}>
            <span><img src={Icons.plus} alt="" /></span>
            Edit Skill
          </button>
        </div>
      </div>
    </>
  )
}

export default EditUser
