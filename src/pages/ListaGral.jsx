import React, { useState, useEffect, useContext } from 'react';
import Head from "./Head";
import { AuthContext } from "../../context/AuthContext";
import { Navigate } from 'react-router';
import { IoIosArrowDown } from "react-icons/io";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocalStorage } from "../CustomHooks/useLocalStorage";
import { vendedores } from "../Vendedores";
import moment from 'moment';



function ListaGral({ infos }) {
  const [filteredInfos, setFilteredInfos] = useState([]);
  const [user, setUser] = useLocalStorage("user", {});
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const normalNote = "flex text-center  items-center justify-center h-8 px-2 border-b-2 border-l-0 border-black "
  const receivedNote = "flex text-center items-center justify-center h-8 px-2 border-b-2 border-l-0 bg-green-500 border-black text-black"
  const cancelledNote = "flex text-center items-center justify-center h-8 px-2 border-b-2 border-l-0 bg-orange-500 text-white border-black text-black"
  const options = ["Todos los estados", 'Facturado', 'Deposito', 'Salida de Deposito', "Entregado", "Contable Recibido", "Cancelar Nota"];
  const [inputs, setInputs] = useState({
    factura: '',
    remision: '',
    cliente: '',
    vendedor: "",
    estado: "",
    modo:""
  });
  const modes = ["Todos los modos","Cancelado","Entregado","En Proceso"];

  if (!user) {
    return <Navigate to="/" />;
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const toggleMenu2 = () => {
    setIsOpen2(!isOpen2);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  const selectOption = (option) => {
    setInputs({
      ...inputs,
      estado: option
    });
    setIsOpen(false);
  };
  const selectMode = (mode) => {
    setInputs({
      ...inputs,
      modo: mode
    });
    setIsOpen2(false);
  };

  const filterData = () => {
    let filtered = infos;
     
    if (inputs.factura) {
      filtered = filtered.filter(info => info.factura.includes(inputs.factura));
    }
    if (inputs.remision) {
      filtered = filtered.filter(info => info.remision.includes(inputs.remision));
    }
    if (inputs.cliente) {
      filtered = filtered.filter(info => info.clienteName.toLowerCase().replace(/\s+/g, '').includes(inputs.cliente.toLowerCase().replace(/\s+/g, '')));
      
    }
    if (inputs.vendedor) {
      filtered = filtered.filter(info => info.VendedorName.toLowerCase().replace(/\s+/g, '').includes(inputs.vendedor.toLowerCase().replace(/\s+/g, '')));
    }
    if (inputs.estado && inputs.estado !== "Todos los estados") {
      filtered = filtered.filter(info => {
        const ultimoEstado = info.estado[info.estado.length - 1];
        return ultimoEstado === inputs.estado;
      });
    }

    setFilteredInfos(filtered);
  };

  function calcularTiempoTranscurrido(fechas) {
    const fechasConvertidas = fechas.map(fecha => moment(fecha, "D/M/YYYY HH:mm"));
    const primeraFecha = fechasConvertidas[0];
    const ultimaFecha = fechasConvertidas[fechasConvertidas.length - 1];
    let diferencia;
    if (primeraFecha || ultimaFecha) {
      diferencia = moment.duration(ultimaFecha.diff(primeraFecha));
    } else {
      return diferencia = "";
    }

    const dias = Math.floor(diferencia.asDays());
    const horas = Math.floor(diferencia.asHours() % 24);
    if (horas === 0) {
      return "";
    }

    return `${dias} días y ${horas} horas`;
  }

  useEffect(() => {
    filterData();
  }, [inputs, infos]);

  return (

    <div>
      <Head />
      <div className=' flex flex-col items-center  justify-center h-screen pt-20 text-[#414193]'>
        <div className='flex items-center justify-center w-full h-20 '>
          <div className='flex items-center justify-center gap-2'>
            <span>Buscar por:</span>
            <div className="bg-[#7878CE1A] px-2 py-2 rounded-xl flex text-sm item-center ">
              <input
                onChange={handleChange}
                placeholder="Nro Factura"
                className="overflow-hidden bg-transparent outline-none"
                type="text"
                name="factura"
                value={inputs.factura}
              />
            </div>
            <div className="bg-[#7878CE1A] px-2 py-2 rounded-xl flex text-sm item-center ">
              <input
                onChange={handleChange}
                placeholder="Nro Remision"
                className="overflow-hidden bg-transparent outline-none"
                type="text"
                name="remision"
                value={inputs.remision}
              />
            </div>
            <div className="bg-[#7878CE1A]  px-2 py-2 rounded-xl flex text-sm item-center ">
              <input
                onChange={handleChange}
                placeholder="Nombre Cliente"
                className="overflow-hidden bg-transparent outline-none"
                type="text"
                name="cliente"
                value={inputs.cliente}
              />
            </div>
            <div className="bg-[#7878CE1A]  px-2 py-2 rounded-xl flex text-sm item-center ">
              <input
                onChange={handleChange}
                placeholder="Nombre Vendedor"
                className="overflow-hidden bg-transparent outline-none"
                type="text"
                name="vendedor"
                value={inputs.vendedor}
              />
            </div>
            <div className='flex flex-col justify-center w-[200px]  text-xs font-medium'>
              <div onClick={toggleMenu} aria-haspopup="true" aria-expanded={isOpen} className="bg-[#7878CE1A] px-2 py-2 rounded-xl pl-8 flex text-sm item-center cursor-pointer relative ">
                <IoIosArrowDown className='absolute text-xs font-bold left-2' />{inputs.estado || 'Estados'}
              </div>
              {isOpen && (
                <div className='relative z-10'>
                  <div className='absolute  top-[0px] w-full text-xs  bg-[#f0f0f7] rounded-lg'>
                    {options.map((option, index) => (
                      <li className='z-10 px-2 py-1 text-xs font-bold border-black cursor-pointer'
                        key={index}
                        tabIndex={0}
                        onClick={() => selectOption(option)}
                        role="menuitem"
                      >
                        {option}
                      </li>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className='flex flex-col justify-center w-[200px]  text-xs font-medium'>
              <div onClick={toggleMenu2} aria-haspopup="true" aria-expanded={isOpen2} className="bg-[#7878CE1A] px-2 py-2 rounded-xl pl-8 flex text-sm item-center cursor-pointer relative ">
                <IoIosArrowDown className='absolute text-xs font-bold left-2' />{inputs.modo || 'Modos'}
              </div>
              {isOpen2 && (
                <div className='relative z-10'>
                  <div className='absolute  top-[0px] w-full text-xs  bg-[#f0f0f7] rounded-lg'>
                    {modes.map((mode, index) => (
                      <li className='z-10 px-2 py-1 text-xs font-bold border-black cursor-pointer'
                        key={index}
                        tabIndex={0}
                        onClick={() => selectMode(mode)}
                        role="menumode"
                      >
                        {mode}
                      </li>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='flex items-start justify-center w-screen h-[70%] '>
          <div className='flex flex-col items-center justify-center w-full gap-2 p-4 '>
            <div className='flex w-full gap-4 pr-4'>
              <h1 className='flex items-center justify-center w-2/5 h-10 text-xl font-bold border-2 border-black'>Lista de Notas</h1>
              <h1 className='flex items-center justify-center w-3/5 h-10 text-xl font-bold border-2 border-black'>Estados</h1>
            </div>
            <div className="flex w-full items-start  gap-4 overflow-scroll  h-[365px] overflow-x-hidden border-2 border-black">
              <div className='flex w-2/5 '>
                <div className='w-1/5 '>
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Factura</span>
                  <div className='w-full text-[11px]  border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={info.estado[info.estado.length - 1] == "Contable Recibido" ? receivedNote : info.estado[info.estado.length - 1] == "Cancelar Nota" ? cancelledNote : normalNote}>
                        {info.factura}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-1/5" >
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Remision</span>
                  <div className='text-[11px]  border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={info.estado[info.estado.length - 1] == "Contable Recibido" ? receivedNote : info.estado[info.estado.length - 1] == "Cancelar Nota" ? cancelledNote : normalNote}>
                        {info.remision}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-2/5" >
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Cliente</span>
                  <div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={info.estado[info.estado.length - 1] == "Contable Recibido" ? receivedNote : info.estado[info.estado.length - 1] == "Cancelar Nota" ? cancelledNote : normalNote}>
                        {info.clienteName}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-1/5">
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Vendedor</span>
                  <div className='text-[7px] font-bold border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={info.estado[info.estado.length - 1] == "Contable Recibido" ? receivedNote : info.estado[info.estado.length - 1] == "Cancelar Nota" ? cancelledNote : normalNote}>
                        {info.VendedorName}
                      </div>
                    ))}
                  </div>
                </div>
                <div className='w-[15%]'>
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Valor</span>
                  <div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={info.estado[info.estado.length - 1] == "Contable Recibido" ? receivedNote : info.estado[info.estado.length - 1] == "Cancelar Nota" ? cancelledNote : normalNote}>
                        <div className='flex flex-col'>
                          {info.valor}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='w-1/5' >
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Deposito</span>
                  <div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={info.estado[info.estado.length - 1] == "Contable Recibido" ? receivedNote : info.estado[info.estado.length - 1] == "Cancelar Nota" ? cancelledNote : normalNote}>
                        {info.deposito == 1 ? "Centro" : "Km-10"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className='flex w-3/5 border-black'>
                <div className='w-[12.5%]'>
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-l-2 border-r-2 border-black '>Facturado</span>
                  <div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={info.estado[info.estado.length - 1] == "Contable Recibido" ? receivedNote + " border-l-2" : info.estado[info.estado.length - 1] == "Cancelar Nota" ? cancelledNote + " border-l-2" : normalNote + " border-l-2"}>
                        <div className='flex flex-col '>
                          {info.estado.map((h,i)=>{
                            if (h == "Facturado") {
                              return info.hora[i]
                            }
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='w-[12.5%]'>
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Deposito</span>
                  <div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={info.estado[info.estado.length - 1] == "Contable Recibido" ? receivedNote : info.estado[info.estado.length - 1] == "Cancelar Nota" ? cancelledNote : normalNote}>
                        <div className='flex flex-col'>
                        {info.estado.map((h,i)=>{
                            if (h == "Deposito") {
                              return info.hora[i]
                            }
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className=''>
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Preparado</span>
                  <div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={info.estado[info.estado.length - 1] == "Contable Recibido" ? receivedNote : info.estado[info.estado.length - 1] == "Cancelar Nota" ? cancelledNote : normalNote}>
                        <div className='flex flex-col'>
                        {info.estado.map((h,i)=>{
                            if (h == "Salida de Deposito") {
                              return info.hora[i]
                            }
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='w-[12.5%]' >
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Entregado</span><div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={info.estado[info.estado.length - 1] == "Contable Recibido" ? receivedNote : info.estado[info.estado.length - 1] == "Cancelar Nota" ? cancelledNote : normalNote}>
                        <div className='flex flex-col'>
                        {info.estado.map((h,i)=>{
                            if (h == "Entregado") {
                              return info.hora[i]
                            }
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='w-[12.5%]' >
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Tiempo</span><div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={info.estado[info.estado.length - 1] == "Contable Recibido" ? receivedNote : info.estado[info.estado.length - 1] == "Cancelar Nota" ? cancelledNote : normalNote}>
                        <div className='flex flex-col'>
                          {calcularTiempoTranscurrido(info.hora)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='w-[12.5%]' >
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Contable</span>
                  <div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={info.estado[info.estado.length - 1] == "Contable Recibido" ? receivedNote : info.estado[info.estado.length - 1] == "Cancelar Nota" ? cancelledNote : normalNote}>
                        <div className='flex flex-col'>
                        {info.estado.map((h,i)=>{
                            if (h == "Contable Recibido") {
                              return info.hora[i]
                            }
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='w-[25%]'>
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Observacion</span>
                  <div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={info.estado[info.estado.length - 1] == "Contable Recibido" ? receivedNote : info.estado[info.estado.length - 1] == "Cancelar Nota" ? cancelledNote : normalNote}>
                        <div className='flex flex-col'>
                          {info.observacion}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <ToastContainer hideProgressBar={false} />
    </div>
  );
}

export default ListaGral;
