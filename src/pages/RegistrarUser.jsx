import React from 'react'
import Head from "./Head";
import { AuthContext } from "../../context/AuthContext";
import { Navigate } from 'react-router';
import { collection, addDoc, getDocs, updateDoc, doc ,deleteDoc} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { ToastContainer, toast } from 'react-toastify';
import { clearInputs } from "../Functions";
import { useRef, useState, useEffect, useContext } from 'react'
import { IoIosArrowDown } from "react-icons/io";
import { FaTrash } from "react-icons/fa";
import { useLocalStorage } from "../CustomHooks/useLocalStorage";

function RegistrarUser() {

  const [userData, setUserData] = useState([])
  const [user, setUser] = useLocalStorage("user",{})
  const [isOpen, setIsOpen] = useState(false);
  const options = ['Admin',"Legal","Deposito","Contable"];
  const [inputs, setInputs] = useState({
    name: "",
    password: "",
    permission: ""
  });

  if (!user) {
    return <Navigate to="/" />
  }

  const clearInputs = () => {
    setInputs({
      name: "",
      password: "",
      permission: "Permisos"
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  };

  const selectOption = (option, i) => {
    setInputs({
      ...inputs,
      "permission": option,

    })
    console.log(inputs)
    setIsOpen(false);
  };

  const handleSaveBtn = async () => {
    if (inputs.name && inputs.password && inputs.permission) {
      await addDoc(collection(db, "usuarios"), inputs)
      toast.success('Guardado correctamente', {
        autoClose: 1400

      });
      clearInputs()
    } else {

      clearInputs();
      toast.error('Datos Vacios', {
        autoClose: 1400
      });
    }
  }

  const getData = async () => {
    const querySnapshot = await getDocs(collection(db, "usuarios"));
    const data = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setUserData(data);
  };

  const deleteData = async (id)=>{
    await deleteDoc(doc(db,"usuarios",id))
  }

  useEffect(() => {
    getData()
  }, [getData])


  return (
    <div>
      <Head />
      <div className='flex items-center justify-center h-screen gap-6 pt-10 text-[#414193]'>
        <div className='h-[70%] w-1/4 border-[1px] flex flex-col justify-start items-center gap-4'>
          <span className='mt-6 text-2xl'>Registre Usuarios</span>
          <div className='border-[1px] w-[80%] flex flex-col justify-center gap-4 rounded-xl h-[65%]'>
            <div className='flex flex-col px-8 text-base font-medium '>
              <span className='ml-2'>Nombre</span>
              <div className="bg-[#7878CE1A] px-4 py-2 rounded-xl flex text-sm item-center ">
                <input
                  value={inputs.name}
                  onChange={handleChange}
                  placeholder="Ingrese un nombre"
                  className="overflow-hidden bg-transparent outline-none"
                  type="text"
                  name="name" />
              </div>
            </div>
            <div className='flex flex-col px-8 text-base font-medium '>
              <span className='ml-2'>Contraseña</span>
              <div className="bg-[#7878CE1A] px-4 py-2 rounded-xl flex text-sm item-center ">
                <input
                  value={inputs.password}
                  onChange={handleChange}
                  placeholder="Ingrese su contraseña"
                  className="overflow-hidden bg-transparent outline-none"
                  type="text"
                  name="password" />
              </div>
            </div>
            <div className='flex flex-col gap-2 px-8 text-base font-medium'>
              <span className='ml-2'>Estado</span>
              <div onClick={toggleMenu} aria-haspopup="true" aria-expanded={isOpen} className="bg-[#f0f0f7] px-4 py-2 rounded-xl pl-8 flex text-sm item-center cursor-pointer relative ">
                <IoIosArrowDown className='absolute text-xl left-2' />{inputs.permission || 'Permisos'}

              </div>
              {isOpen
                ?
                <div className='relative'>
                  <div className='absolute top-[-10px] w-full text-xs z-100 bg-[#f0f0f7] rounded-lg'>
                    {options.map((option, index) => (
                      <li className='px-2 py-1 text-xs font-bold border-black cursor-pointer'
                        key={index}
                        tabIndex={0}
                        onClick={() => selectOption(option, index)}
                        role="menuitem"

                      >
                        {option}
                      </li>
                    ))}
                  </div>
                </div>
                : <div></div>
              }
            </div>
          </div>
          <button onClick={handleSaveBtn} className='px-5 py-2 text-white bg-green-800 cursor-pointer rounded-2xl hover:bg-black '>Guardar</button>
        </div>
        <div className='h-[70%] w-1/4 border-[1px]  flex flex-col justify-start items-center gap-4'>
          <span className='mt-6 text-2xl'>Usuarios</span>
          <div className='border-[1px] overflow-scroll w-[80%] rounded-xl h-[65%]'>
            {userData.map((user, i) => (
              <div className="bg-[#7878CE1A] px-4 py-2 m-2 rounded-xl flex text-sm item-center justify-start gap-4 " key={i}>
                <div className='flex flex-col'>
                  <span className='font-bold'>Nombre</span>
                  {user.name}
                </div>
                <div className='flex flex-col'>
                  <span className='font-bold'>Permisos</span>
                  {user.permission}
                </div>
                <div 
                  onClick={()=>(deleteData(user.id))}
                 className='flex items-center justify-center pl-8 text-base font-bold text-red-800 cursor-pointer rounded-2xl '>
                  <FaTrash />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ToastContainer
        hideProgressBar={false}
      />
    </div>
  )
}

export default RegistrarUser