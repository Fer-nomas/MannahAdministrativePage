import React from 'react'
import Head from "./Head";
import { AuthContext } from "../../context/AuthContext";
import { Navigate } from 'react-router';
import { useRef, useState, useEffect, useContext } from 'react'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { IoIosArrowDown } from "react-icons/io";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useLocalStorage } from "../CustomHooks/useLocalStorage";
import { clearInputs, handleChange, updateData, getDateNow } from "../Functions";

function AgregarDatos({ infos }) {
    const input1Ref = useRef(null);
    const input2Ref = useRef(null);
    const input3Ref = useRef(null);
    const input4Ref = useRef(null);
    const input5Ref = useRef(null);
    const input6Ref = useRef(null);
    const input7Ref = useRef(null);
    const [editMode, setEditMode] = useState(false);
    const [user, setUser] = useLocalStorage("user", {});
    const [isOpen, setIsOpen] = useState(false);
    let options = [];
    const [inputs, setInputs] = useState({
        factura: '',
        remision: '',
        cliente: '',
        clienteNum: "",
        vendedor: "",
        vendedorNum: "",
        estado: ["Facturado"],
        hora: [getDateNow()],
        deposito: "",
        valor: "",
        observacion: ""
    });

    const optionss = () => {

        if (user.permission == "Admin") {
            options = ['Facturado', 'Deposito', 'Salida de Deposito', "Entregado", "Contable Recibido", "Cancelar Nota"];
        } else if (user.permission == "Deposito Centro" || user.permission == "Deposito Km10") {
            options = ['Salida de Deposito', "Entregado"];
        } else if (user.permission == "Contable") {
            options = ["Contable Recibido"];
        }
        else if (user.permission == "Legal") {
            options = ['Deposito'];
        }
        return options;
    }
    optionss();

    const handleKeyDown = (event, nextInputRef, pastInputRef) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (nextInputRef && nextInputRef.current) {
                nextInputRef.current.focus();
            }
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            if (pastInputRef && pastInputRef.current) {
                pastInputRef.current.focus();
            }
        }
    };

    const toggleEditMode = () => {
        user.permission == "Admin" ? setEditMode(!editMode) : "";
    };

    if (!user) {
        return <Navigate to="/" />;
    }

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const limpiarCasillas = () => {
        clearInputs(setInputs);
        setEditMode(false);
        input1Ref.current.focus();
    };

    const validarDatos = () => {

        if (inputs.estado[inputs.estado.length - 1] == "Cancelar Nota" && inputs.observacion.trim() == "") {

            toast.error("Debe proporcionar una observación al seleccionar 'Cancelar Nota'");
            return false;
        }
        return true;
    };

    const selectOption = (option) => {

        let estadoFinal = [...inputs.estado];
        let horaFinal = [...inputs.hora];

        if (!estadoFinal.includes(option)) {
            estadoFinal.push(option);
            horaFinal.push(getDateNow());
        }

        // Asegurarse de que el número de estados coincida con el número de horas
        if (estadoFinal.length !== horaFinal.length) {
            horaFinal = estadoFinal.map((_, index) => horaFinal[index] || getDateNow());
        }

        if (inputs.estado[inputs.estado.length - 1] !== "Cancelar Nota") {
            setInputs({
                ...inputs,
                estado: estadoFinal,
                hora: horaFinal
            });
        } else {
            toast.error('Esta nota ya ha sido cancelada', {
                autoClose: 1400
            });
        }

        setIsOpen(false);
    };

    const guardarDatos = () => {

        if (validarDatos()) {
            updateData(inputs, toast, setInputs, editMode, user);
            setEditMode(false);
        }
    };

    const handleSaveKey = async (event) => {
        if (event.code === 'NumpadAdd' || event.key === '+') {
            event.preventDefault();
            guardarDatos();
            setEditMode(false);
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", handleSaveKey);
        return () => document.removeEventListener("keydown", handleSaveKey);
    }, [inputs, editMode]);

    return (
        <div className='font-sans flex flex-col items-center justify-center h-screen text-[#414193]'>
            <Head />
            {!editMode && user.permission == "Admin" ? <h1 className="m-6 text-3xl text-blue-500">Agregar Datos</h1> : <h1 className="m-6 text-3xl text-orange-500">Editando Datos</h1>}

            <div className='flex flex-wrap justify-center items-center gap-4 p-4 px-10 border-[1px] rounded-lg'>
                {inputs.remision !== undefined && (
                    <div className='flex flex-col gap-2 text-base font-medium'>
                        <span className='ml-2'>Remision</span>
                        <div className="bg-[#7878CE1A] px-4 py-2 rounded-xl flex text-sm item-center">
                            <input
                                ref={input1Ref}
                                onKeyDown={(event) => handleKeyDown(event, input2Ref, input7Ref)}
                                onChange={(event) => handleChange(event, setInputs, inputs, setEditMode, options, infos)}
                                placeholder="000000"
                                className="overflow-hidden bg-transparent outline-none"
                                type="text"
                                autoComplete="off"
                                name="remision"
                                value={inputs.remision}
                            />
                        </div>
                    </div>
                )}
                {inputs.factura !== undefined && (
                    <div className='flex flex-col gap-2 text-base font-medium'>
                        <span className='ml-2'>Factura</span>
                        <div className="bg-[#7878CE1A] px-4 py-2 rounded-xl flex text-sm item-center">
                            <input
                                ref={input2Ref}
                                onKeyDown={(event) => handleKeyDown(event, input3Ref, input1Ref)}
                                value={inputs.factura}
                                onChange={(event) => handleChange(event, setInputs, inputs, setEditMode, options, infos)}
                                placeholder="0000000"
                                className="overflow-hidden bg-transparent outline-none"
                                type="text"
                                autoComplete="off"
                                name="factura"
                            />
                        </div>
                    </div>
                )}



                {inputs.cliente !== undefined && (
                    <div className='flex flex-col gap-2 text-base font-medium'>
                        <span className='ml-2'>Cliente</span>
                        <div className="bg-[#7878CE1A] px-4 py-2 rounded-xl flex text-sm item-center">
                            <input
                                ref={input3Ref}
                                onKeyDown={(event) => handleKeyDown(event, input4Ref, input2Ref)}
                                onChange={(event) => handleChange(event, setInputs, inputs, setEditMode)}
                                placeholder="00000"
                                className="overflow-hidden bg-transparent outline-none"
                                type="text"
                                autoComplete="off"
                                name="cliente"
                                value={inputs.cliente}
                                readOnly={(editMode && user.permission != "Admin")}
                            />
                        </div>
                    </div>
                )}

                {inputs.vendedor !== undefined && (
                    <div className='flex flex-col gap-2 text-base font-medium'>
                        <span className='ml-2'>Vendedor</span>
                        <div className="bg-[#7878CE1A] px-4 py-2 rounded-xl flex text-sm item-center">
                            <input
                                ref={input4Ref}
                                onKeyDown={(event) => handleKeyDown(event, input5Ref, input3Ref)}
                                onChange={(event) => handleChange(event, setInputs, inputs, setEditMode)}
                                placeholder="000"
                                className="overflow-hidden bg-transparent outline-none"
                                type="text"
                                autoComplete="off"
                                name="vendedor"
                                value={inputs.vendedor}
                                readOnly={(editMode && user.permission != "Admin")}
                            />
                        </div>
                    </div>
                )}


                <div className='flex flex-col gap-2 text-base font-medium'>
                    <span className='ml-2'>Deposito</span>
                    <div className="bg-[#7878CE1A] px-4 py-2 rounded-xl flex text-sm item-center">
                        <input
                            ref={input5Ref}
                            onKeyDown={(event) => handleKeyDown(event, input6Ref, input4Ref)}
                            onChange={(event) => handleChange(event, setInputs, inputs, setEditMode)}
                            placeholder="1 - 2"
                            className="overflow-hidden bg-transparent outline-none"
                            type="text"
                            autoComplete="off"
                            name="deposito"
                            value={inputs.deposito}
                            readOnly={(editMode && user.permission != "Admin")}
                        />
                    </div>
                </div>



                <div className='flex flex-col gap-2 text-base font-medium'>
                    <span className='ml-2'>Observacion</span>
                    <div className="bg-[#7878CE1A] px-4 py-2 rounded-xl flex text-sm item-center">
                        <input
                            ref={input6Ref}
                            onKeyDown={(event) => handleKeyDown(event, input7Ref, input5Ref)}
                            onChange={(event) => handleChange(event, setInputs, inputs, setEditMode)}
                            placeholder="Obs"
                            className="overflow-hidden bg-transparent outline-none"
                            type="text"
                            autoComplete="off"
                            name="observacion"
                            value={inputs.observacion}

                        />
                    </div>
                </div>



                <div className='flex flex-col gap-2 text-base font-medium'>
                    <span className='ml-2'>Valor</span>
                    <div className="bg-[#7878CE1A] px-4 py-2 rounded-xl flex text-sm item-center">
                        <input
                            ref={input7Ref}
                            onKeyDown={(event) => handleKeyDown(event, input1Ref, input6Ref)}
                            onChange={(event) => handleChange(event, setInputs, inputs, setEditMode)}
                            placeholder="$$$"
                            className="overflow-hidden bg-transparent outline-none"
                            type="text"
                            autoComplete="off"
                            name="valor"
                            value={inputs.valor}
                            readOnly={(editMode && user.permission != "Admin")}
                        />
                    </div>
                </div>


                <div className='flex flex-col w-[200px] gap-2 text-base font-medium'>
                    <span className='ml-2'>Estado</span>
                    <div onClick={toggleMenu} aria-haspopup="true" aria-expanded={isOpen} className="bg-[#7878CE1A] px-4 py-2 rounded-xl pl-8 flex text-sm item-center cursor-pointer relative ">
                        <IoIosArrowDown className='absolute text-xl left-2' />{inputs.estado[inputs.estado.length - 1] || options[0]}
                    </div>
                    {isOpen
                        ? <div className='relative'>
                            <div className='absolute top-[-10px] w-full text-xs z-100 bg-[#f0f0f7] rounded-lg'>
                                {options.map((option, index) => (
                                    <li className='px-2 py-1 text-xs font-bold border-black cursor-pointer'
                                        key={index}
                                        tabIndex={0}
                                        onClick={() => selectOption(option, index, inputs, setInputs, setIsOpen)}
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

            <div className='flex p-10 gap-9'>
                <button onClick={limpiarCasillas} className='px-6 py-4 text-white bg-yellow-500 cursor-pointer rounded-2xl hover:bg-black'>
                    Limpiar Casillas
                </button>
                {user.permission == "Admin" && (!editMode
                    ? (
                        <button onClick={toggleEditMode} className='px-6 py-4 text-white bg-orange-500 cursor-pointer rounded-2xl hover:bg-black'>
                            Editar Datos
                        </button>
                    )
                    : (
                        <button onClick={toggleEditMode} className='px-6 py-4 text-white bg-blue-500 cursor-pointer rounded-2xl hover:bg-black'>
                            Agregar Datos
                        </button>
                    )
                )}
                <button onClick={guardarDatos} className='px-6 py-4 text-white bg-green-800 cursor-pointer rounded-2xl hover:bg-black'>
                    Guardar
                </button>
            </div>

            <ToastContainer></ToastContainer>
        </div>
    );
}

export default AgregarDatos;
