import React, { useState, useEffect } from 'react';
import Head from "./Head";
import { Navigate } from 'react-router';
import { IoIosArrowDown } from "react-icons/io";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocalStorage } from "../CustomHooks/useLocalStorage";

import { validateInput, descargarTxt, calcularTiempoTranscurrido } from "../Functions";



function ListaGral({ infos }) {
  const [filteredInfos, setFilteredInfos] = useState([]);
  const [user, setUser] = useLocalStorage("user", {});
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const normalNote = "flex text-center  items-center justify-center h-8 px-2 border-b-2 border-l-0 border-black "
  const receivedNote = "flex text-center items-center justify-center h-8 px-2 border-b-2 border-l-0 bg-green-500 border-black text-black"
  const cancelledNote = "flex text-center items-center justify-center h-8 px-2 border-b-2 border-l-0 bg-orange-500 text-white border-black text-black"
  const options = ["Todos los estados", 'Facturado', 'Deposito', 'Salida de Deposito', "Entregado", "Contable Recibido", "Cancelar Nota", "En Proceso"];

  const [inputs, setInputs] = useState({
    factura: '',
    remision: '',
    clienteName: '',
    vendedorName: "",
    estado: "",
    modo: "Centro",
    clienteNum: "",
    fecha: "",
    creacion: "Mas Nuevo"
  });
  const deposito = ["Todos","Centro", "Km-10"];
  const relevancia = ["Mas Nuevo", "Mas Viejo"];
  
  

  if (!user) {
    return <Navigate to="/" />;
  }

  const parseDate = (dateString) => {
    const [datePart, timePart] = dateString.split(' '); // Separar fecha y hora
    const [day, month, year] = datePart.split('/'); // Separar día, mes y año
    return new Date(`${year}-${month}-${day}T${timePart}`); // Crear fecha en formato ISO
  };
  const checkState = (e)=>{
    if (e.includes("Cancelar Nota")) {
      return cancelledNote
    }else if(e.includes("Contable Recibido")){
      return receivedNote
    }else{
      return normalNote
    }
  }

  const sortDataByDate = (data, order) => {

    return data.sort((a, b) => {
      const dateA = parseDate(a.hora[0]);
      const dateB = parseDate(b.hora[0]);

      return order == 'Mas Nuevo' || order == "" ? dateB - dateA : dateA - dateB;
    });
  };


  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const toggleMenu2 = () => {
    setIsOpen2(!isOpen2);
  };
  const toggleMenu3 = () => {
    setIsOpen3(!isOpen3);
  };

  const clearInputs = () => {
    setInputs({
      factura: '',
      remision: '',
      clienteName: '',
      vendedorName: "",
      estado: "",
      modo: "",
      clienteNum: "",
      fecha: "",
      creacion: ""
    })
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    const validatedValue = validateInput(name, value);

    setInputs({
      ...inputs,
      [name]: validatedValue,
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
  const selectCreated = (create) => {
    setInputs({
      ...inputs,
      creacion: create,
    });

    setIsOpen3(false);


  };




  const filterData = () => {
    let filtered = infos;

    if (inputs.factura) {
      filtered = filtered.filter(info => info.factura.includes(inputs.factura));
    }
    if (inputs.remision) {
      filtered = filtered.filter(info => info.remision.includes(inputs.remision));
    }
    if (inputs.clienteName) {
      filtered = filtered.filter(info => info.clienteName.toLowerCase().replace(/\s+/g, '').includes(inputs.clienteName.toLowerCase().replace(/\s+/g, '')));
    }
    if (inputs.clienteNum) {
      filtered = filtered.filter(info => info.cliente.includes(inputs.clienteNum));
    }
    if (inputs.vendedorName ) {
      filtered = filtered.filter(info => info.VendedorName.toLowerCase().replace(/\s+/g, '').includes(inputs.vendedorName.toLowerCase().replace(/\s+/g, '')));
    }
    if (inputs.modo && inputs.modo != "Todos") {
      filtered = filtered.filter(info => {
        let modo = inputs.modo == "Centro" ? 1 : 2
        return info.deposito.toLowerCase().includes(modo)
      });
    }
    if (inputs.fecha) {
      if (inputs.estado == "" || inputs.estado == "Todos los estados" || inputs.estado == "Facturado") {
        filtered = filtered.filter(info => info.hora[0].includes(inputs.fecha));
      } else if (inputs.estado == "Deposito") {
        filtered = filtered.filter((info, i) => {
          let s;
          info.estado.forEach((e, i) => {
            const ultimoEstado = info.estado[info.estado.length - 1];
            s = (e == inputs.estado && ultimoEstado == inputs.estado && info.hora[i].includes(inputs.fecha))
          })
          return s
        });
      }
      else if (inputs.estado == "Salida de Deposito") {
        filtered = filtered.filter((info, i) => {
          let s;
          info.estado.forEach((e, i) => {
            const ultimoEstado = info.estado[info.estado.length - 1];
            s = (e == inputs.estado && ultimoEstado == inputs.estado && info.hora[i].includes(inputs.fecha))
          })
          return s
        });
      }
      else if (inputs.estado == "Entregado") {
        filtered = filtered.filter((info, i) => {
          let s;
          info.estado.forEach((e, i) => {
            const ultimoEstado = info.estado[info.estado.length - 1];
            s = (e == inputs.estado && ultimoEstado == inputs.estado && info.hora[i].includes(inputs.fecha))
          })
          return s
        });
      }
      else if (inputs.estado == "Contable Recibido") {
        filtered = filtered.filter((info, i) => {
          let s;
          info.estado.forEach((e, i) => {
            const ultimoEstado = info.estado[info.estado.length - 1];
            s = (e == inputs.estado && ultimoEstado == inputs.estado && info.hora[i].includes(inputs.fecha))
          })
          return s
        });
      }
      else if (inputs.estado == "Cancelar Nota") {
        filtered = filtered.filter((info, i) => {
          let s;
          info.estado.forEach((e, i) => {
            const ultimoEstado = info.estado[info.estado.length - 1];
            s = (e == inputs.estado && ultimoEstado == inputs.estado && info.hora[i].includes(inputs.fecha))
          })
          return s
        });
      }
    }

    if (inputs.estado == "En Proceso") {
      filtered = filtered.filter((info) => {
        let s;
        s = (!info.estado.includes("Cancelar Nota") && !info.estado.includes("Contable Recibido"))
        return s
      });
    } else if (inputs.estado && inputs.estado !== "Todos los estados") {
      filtered = filtered.filter(info => {
        const ultimoEstado = info.estado[info.estado.length - 1];
        return ultimoEstado === inputs.estado;
      });
    }

    filtered = sortDataByDate(filtered, inputs.creacion);
    
    setFilteredInfos(filtered);
  }

  useEffect(() => {
    if (user.permission == "Deposito Centro") {
    setInputs({
      ...inputs,
      creacion:"Mas Viejo",
      estado: "En Proceso",
    })
  }else if(user.permission == "Deposito Km10"){
    setInputs({
      ...inputs,
      creacion:"Mas Viejo",
      modo:"Km 10",
      estado: "En Proceso",
    })
  }else if(user.permission == "Contable"){
    setInputs({
      ...inputs,
      modo:"Todos",
      estado: "En Proceso",
      
    }) 
  }else if(user.permission == "Admin"){
    setInputs({
      ...inputs,
      modo:"Todos",
      estado:"En Proceso"
    })
    
  }
    
  }, []);
  useEffect(() => {
    
    filterData();
  }, [inputs]);


  return (

    <div>
      <Head />
      <div className=' flex flex-col items-center overflow-hidden  justify-center h-screen pt-20 text-[#414193]'>
        <div className='flex items-center justify-center w-full h-20 '>
          <div className='flex flex-wrap items-center justify-center gap-2 '>
            <span>Buscar por:</span>
            <div className="bg-[#7878CE1A] px-2 py-2 rounded-xl flex text-sm item-center ">
              <input
                onChange={handleChange}
                autoComplete="off"
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
                autoComplete="off"
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
                autoComplete="off"
                name="clienteName"
                value={inputs.clienteName}
              />
            </div>
            <div className="bg-[#7878CE1A]  px-2 py-2 rounded-xl flex text-sm item-center ">
              <input
                autoComplete="off"
                onChange={handleChange}
                placeholder="Num Cliente"
                className="overflow-hidden bg-transparent outline-none"
                type="text"
                name="clienteNum"
                value={inputs.clienteNum}
              />
            </div>
            <div className="bg-[#7878CE1A]  px-2 py-2 rounded-xl flex text-sm item-center ">
              <input
                autoComplete="off"
                onChange={handleChange}
                placeholder="Nombre Vendedor"
                className="overflow-hidden bg-transparent outline-none"
                type="text"
                name="vendedorName"
                value={inputs.vendedorName}
              />
            </div>
            <div className="bg-[#7878CE1A]  px-2 py-2 rounded-xl flex text-sm item-center ">
              <input
                onChange={handleChange}
                placeholder="Fecha dd/mm/yyyy"
                className="overflow-hidden bg-transparent outline-none"
                type="text"
                autoComplete="off"
                name="fecha"
                value={inputs.fecha}
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
                <IoIosArrowDown className='absolute text-xs font-bold left-2' />{inputs.modo || 'Deposito'}
              </div>
              {isOpen2 && (
                <div className='relative z-10'>
                  <div className='absolute  top-[0px] w-full text-xs  bg-[#f0f0f7] rounded-lg'>
                    {deposito.map((mode, index) => (
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
            <div className='flex flex-col justify-center w-[200px]  text-xs font-medium'>
              <div onClick={toggleMenu3} aria-haspopup="true" aria-expanded={isOpen3} className="bg-[#7878CE1A] px-2 py-2 rounded-xl pl-8 flex text-sm item-center cursor-pointer relative ">
                <IoIosArrowDown className='absolute text-xs font-bold left-2' />{inputs.creacion || 'Relevancia'}
              </div>
              {isOpen3 && (
                <div className='relative z-10'>
                  <div className='absolute  top-[0px] w-full text-xs  bg-[#f0f0f7] rounded-lg'>
                    {relevancia.map((create, index) => (
                      <li className='z-10 px-2 py-1 text-xs font-bold border-black cursor-pointer'
                        key={index}
                        tabIndex={0}
                        onClick={() => selectCreated(create)}
                        role="menurel"
                      >
                        {create}
                      </li>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div
              onClick={() => (descargarTxt(filteredInfos))}
              className='bg-[#2828e77a] text-white font-medium items-center justify-center  px-4 py-2 rounded-full flex text-sm item-center cursor-pointer relative'>
              Descargar Txt
            </div>
            <div
              onClick={clearInputs}
              className='bg-[#2828e77a] text-white font-medium items-center justify-center  px-4 py-2 rounded-full flex text-sm item-center cursor-pointer relative'>
              Limpiar Casillas
            </div>
          </div>
        </div>
        <div className='flex items-start justify-center w-screen h-[70%] '>
          <div className='flex flex-col items-center justify-center w-full gap-2 p-4 '>
            <div className='flex w-full gap-4 pr-4'>
              <h1 className='flex items-center justify-center w-2/5 h-10 text-xl font-bold border-2 bg-[#F1F1FA] border-black'>Lista de Notas</h1>
              <h1 className='flex items-center justify-center w-3/5 h-10 text-xl font-bold border-2 border-black bg-[#7878CE1A]'>Estados</h1>
            </div>
            <div className="flex w-full items-start  gap-4 overflow-scroll  h-[365px] overflow-x-hidden border-2 border-black">
              <div className='flex w-2/5 '>
                <div className='w-[20%] '>
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black'>Factura</span>
                  <div className='w-full text-[9px] font-bold border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={checkState(info.estado)}>
                        {info.factura ? "001-" + info.factura : ""}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-[12%]" >
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Remision</span>
                  <div className='text-[11px] font-bold border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={checkState(info.estado)}>
                        {info.remision}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-[50%]" >
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Cliente</span>
                  <div className='text-[10px] font-bold border-2 border-l-0 border-black '>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={checkState(info.estado)}>
                        {info.clienteName}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-1/5">
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Vendedor</span>
                  <div className='text-[9px] font-bold border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={checkState(info.estado)}>
                        {info.VendedorName}
                      </div>
                    ))}
                  </div>
                </div>
                <div className='w-[12%]'>
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Valor</span>
                  <div className='text-[11px] font-bold border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={checkState(info.estado)}>
                        <div className='flex flex-col'>
                          {info.valor}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='w-[12%]' >
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-white border-b-2 border-r-2 border-black '>Deposito</span>
                  <div className='text-[11px] font-bold border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={checkState(info.estado)}>
                        {info.deposito == 1 ? "Centro" : info.deposito == 2 ? "Km-10" : "Deposito No Encontrado"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className='flex w-3/5 border-black'>
                <div className='w-[12.5%]'>
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold  border-b-2 border-l-2 border-r-2 border-black bg-[#F1F1FA]'>Facturado</span>
                  <div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={checkState(info.estado)+" border-l-2"}>
                        <div className='flex flex-col font-bold '>
                          {info.estado.map((h, i) => {
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
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-[#F1F1FA] border-b-2 border-r-2 border-black '>Deposito</span>
                  <div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={checkState(info.estado)}>
                        <div className='flex flex-col font-bold'>
                          {info.estado.map((h, i) => {
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
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-[#F1F1FA] border-b-2 border-r-2 border-black '>Preparado</span>
                  <div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={checkState(info.estado)}>
                        <div className='flex flex-col font-bold'>
                          {info.estado.map((h, i) => {
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
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-[#F1F1FA] border-b-2 border-r-2 border-black '>Entregado</span><div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={checkState(info.estado)}>
                        <div className='flex flex-col font-bold'>
                          {info.estado.map((h, i) => {
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
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-[#F1F1FA] border-b-2 border-r-2 border-black '>Tiempo</span><div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={checkState(info.estado)}>
                        <div className='flex flex-col font-bold'>
                          {calcularTiempoTranscurrido(info)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='w-[12.5%]' >
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-[#F1F1FA] border-b-2 border-r-2 border-black '>Contable</span>
                  <div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={checkState(info.estado)}>
                        <div className='flex flex-col font-bold'>
                          {info.estado.map((h, i) => {
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
                  <span className='sticky top-0 flex items-center justify-center p-2 text-xs font-bold bg-[#F1F1FA] border-b-2 border-r-2 border-black '>Observacion</span>
                  <div className='text-[11px] border-2 border-l-0 border-black'>
                    {filteredInfos.map((info) => (
                      <div key={info.id} className={checkState(info.estado)}>
                        <div className='flex flex-col font-bold'>
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
