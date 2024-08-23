import React, { useContext } from 'react'
import { Outlet, Link, Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useLocalStorage } from "../CustomHooks/useLocalStorage";
function Header() {
    const [user, setUser] = useLocalStorage("user",{})

    const handleLogout = () => {
        setUser("")
    }
    return (
        <div className='border-gray-900 border-b-[1.5px] w-screen absolute z-100 top-0 flex justify-center items-center text-[#7a7a7a] flex-col bg-white'>
            <img className='h-20' src="https://mannah.com.py/wp-content/uploads/2024/02/cropped-LOGO-MANNAH-512X512-1-300x149.png" alt="" />
            <div className='flex justify-center w-full gap-6 text-xs font-bold cursor-pointer'>
                <Link to="/agregardatos">
                    <div className='py-2 hover:text-[#414193] rounded-full hover:bg-[#7878ce1a] px-4 duration-200'>Agregar Datos</div>
                </Link>
                <Link to="/listagral">
                    <div className='py-2 hover:text-[#414193] rounded-full hover:bg-[#7878ce1a] px-4 duration-200'>Lista General</div>
                </Link>
                {user.permission.toLowerCase() == "admin" ? <>
                    <Link to={"/registraruser"}>
                        <div className='py-2 hover:text-[#414193] rounded-full hover:bg-[#7878ce1a] px-4 duration-200'>Registrar Usuarios</div>
                    </Link>

                    <div className='absolute top-4 right-2 flex items-center justify-center w-20 h-7 rounded-full text-white bg-[#414193]'>Admin</div>
                </>

                    :
                    <div></div>
                }
                <Link to={"/"}>
                    <button className='py-2 hover:text-[#a33636] rounded-full hover:bg-[#e656561a] px-4 duration-200' onClick={handleLogout}>Cerrar Sesion</button>
                </Link>
            </div>
            <Outlet />
        </div>
    )
}

export default Header