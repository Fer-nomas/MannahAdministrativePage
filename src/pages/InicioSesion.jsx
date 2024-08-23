import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../CustomHooks/useLocalStorage';

function InicioSesion() {
    const navigate = useNavigate();
    const [user, setUser] = useLocalStorage('user', "");

    if (user != "") {
        navigate('/agregardatos');
    }

    const Initialvalues = {
        name: '',
        password: '',
    };

    const [values, setValues] = useState(Initialvalues);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    const handleSubmitForm = () => {
        getAuth();
        setValues(Initialvalues);
    };

    const getAuth = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'usuarios'));
            querySnapshot.forEach((doc) => {
                verifiedlogin(doc.data());
            });
        } catch (error) {
            toast.error('Error fetching data', {
                autoClose: 1400,
            });
        }
    };

    const verifiedlogin = (d) => {
        if (
            d.name.trim().toUpperCase() === values.name.trim().toUpperCase() &&
            d.password.trim() === values.password.trim()
        ) {
            setUser(d);
            toast.success(`Bienvenido ${d.name}`, {
                autoClose: 1400,
            });
            navigate('/agregardatos');
        } else {
            toast.error('Datos Incorrectos', {
                autoClose: 1400,
            });
        }
    };

    return (
        <div className='relative flex flex-col items-center justify-center h-screen'>
            <div className='absolute top-0 flex justify-center w-screen'>
                <img
                    className='h-20'
                    src='https://mannah.com.py/wp-content/uploads/2024/02/cropped-LOGO-MANNAH-512X512-1-300x149.png'
                    alt='Logo'
                />
            </div>
            <h1 className='text-[#414193] font-bold mb-6 text-4xl'>Inicia Sesion</h1>
            <div className='flex flex-col gap-6 border-[1px] w-1/4 h-1/2 p-6 rounded-lg'>
                <div className='flex flex-col gap-2 text-base font-medium'>
                    <span className='ml-2'>Usuario</span>
                    <div className='bg-[#7878CE1A] px-4 py-2 rounded-xl flex text-sm item-center'>
                        <input
                            value={values.name}
                            name='name'
                            onChange={handleInputChange}
                            className='overflow-hidden bg-transparent outline-none'
                            placeholder='Ingrese su nombre'
                            type='text'
                        />
                    </div>
                </div>
                <div className='flex flex-col gap-2 text-base font-medium'>
                    <span className='ml-2'>Contraseña</span>
                    <div className='bg-[#7878CE1A] px-4 py-2 rounded-xl flex text-sm item-center'>
                        <input
                            value={values.password}
                            name='password'
                            onChange={handleInputChange}
                            className='overflow-hidden bg-transparent outline-none'
                            placeholder='Ingrese contraseña'
                            type='password'
                        />
                    </div>
                </div>
                <div className='flex items-end justify-center h-full mb-5'>
                    <button
                        onClick={handleSubmitForm}
                        className='hover:bg-black duration-300 w-1/2 rounded-xl px-3 py-[6px] text-white text-base bg-[#414193]'
                    >
                        Iniciar Sesion
                    </button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default InicioSesion;
