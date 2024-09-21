import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { toast } from 'react-toastify';
import moment from 'moment';

export const getDateNow = () => {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0'); // Formatear el mes a dos dígitos
    const d = String(date.getDate()).padStart(2, '0'); // Formatear el día a dos dígitos
    let h = String(date.getHours()).padStart(2, '0'); // Formatear la hora a dos dígitos
    let min = String(date.getMinutes()).padStart(2, '0'); // Formatear los minutos a dos dígitos

    return `${d}/${m}/${y} ${h}:${min}`;
};

let swit = "";
const compareData = async (inputs) => {
    swit = true
    const querySnapshot = await getDocs(collection(db, "datos"));
    querySnapshot.docs.forEach(async (d) => {
        //console.log(d.data().remision," ", inputs.remision)

        if (d.data().remision == inputs.remision || (d.data().factura == inputs.factura && d.data().factura != "")) {
            swit = false
        }
    })

};

export const clearInputs = (setInputs) => {
    setInputs({
        factura: '',
        remision: '',
        cliente: '',
        clienteNum: "",
        vendedor: "",
        vendedorNum: "",
        estado: ['Facturado'],
        hora: [],
        deposito: "",
        valor: "",
        observacion: ""
    });

};

export const getData = async (e, setInputs, setEditMode, options, infos, inputs) => {
    const querySnapshot = await getDocs(collection(db, "datos"));
    querySnapshot.docs.forEach((d, i) => {
        if ((d.data().factura === e.value && e.name == "factura" && e.value !== "") || (d.data().remision === e.value && e.name == "remision")) {
            let estadoFinal = d.data().estado;
            let horaFinal = d.data().hora;
            const primerValorOption = options[0];
            if (!estadoFinal.includes(primerValorOption) && !estadoFinal.includes("Cancelar Nota")) {
                estadoFinal = [...estadoFinal, primerValorOption];
                horaFinal = [...horaFinal, getDateNow()];
            }
            if (estadoFinal.length !== horaFinal.length) {
                horaFinal = estadoFinal.map((_, index) => horaFinal[index] || getDateNow());
            }

            setInputs({
                factura: d.data().factura,
                remision: d.data().remision,
                clienteNum: d.data().clienteNum,
                vendedorNum: d.data().vendedorNum,
                cliente: infos[i].clienteName,
                vendedor: infos[i].VendedorName,
                estado: estadoFinal,
                hora: horaFinal,
                deposito: d.data().deposito,
                valor: d.data().valor,
                observacion: d.data().observacion,
                id: d.id
            });

            setEditMode(true);
        }
    });


};

export const updateData = async (inputs, toast, setInputs, editMode, user) => {
    if (user.permission !== "Admin") {
        editMode = true;
    }

    if (inputs.remision !== "" && inputs.estado) {
        await compareData(inputs);

        if (inputs.estado.length !== inputs.hora.length) {
            inputs.hora = inputs.estado.map((_, index) => inputs.hora[index] || getDateNow());
        }


        const updatedInputs = {
            ...inputs,
            cliente: inputs.clienteNum,
            vendedor: inputs.vendedorNum,
        };

        if (editMode) {
            console.log(updatedInputs)
            await updateDoc(doc(db, "datos", inputs.id), updatedInputs);
            toast.warning('Datos Editados correctamente', {
                autoClose: 1400
            });
            clearInputs(setInputs);
        } else if (!editMode && swit) {
            if (inputs.remision.length === 6) {
                await addDoc(collection(db, "datos"), updatedInputs);
                toast.success('Datos Añadidos correctamente', {
                    autoClose: 1400
                });
                clearInputs(setInputs);
            } else {
                toast.error('El Dato de remision debe contener 6 digitos', {
                    autoClose: 1400
                });
            }
        } else {
            toast.error('Datos Iguales', {
                autoClose: 1400
            });
            clearInputs(setInputs);
        }
    } else {
        toast.error('Datos Vacios', {
            autoClose: 1400
        });
        clearInputs(setInputs);
    }
};

export const validateInput = (name, value) => {
    let newValue = value;

    const restrictToNumbers = (val, maxLength) => {
        return val.replace(/\D/g, '').slice(0, maxLength);
    };

    switch (name) {
        case 'factura':
            newValue = newValue.replace(/[^a-zA-Z0-9]/g, ''); // Remover cualquier carácter no alfanumérico
            if (newValue.length > 3) {
                newValue = `${newValue.slice(0, 6)}`;
            }
            break;
        case 'cliente':
            newValue = restrictToNumbers(newValue, 5); // Limitar a números y máximo 5 caracteres
            break;
        case 'vendedor':
            newValue = restrictToNumbers(newValue, 3); // Limitar a números y máximo 3 caracteres
            break;
        case 'remision':
            newValue = restrictToNumbers(newValue, 6); // Limitar a números y máximo 7 caracteres
            break;
        case 'observacion':
            if (newValue.length > 50) {
                newValue = newValue.slice(0, 50);
            }
            break;
        case 'fecha':
            newValue = newValue.replace(/\D/g, ''); // Remover cualquier carácter no numérico
            if (newValue.length > 2 && newValue.length <= 4) {
                newValue = `${newValue.slice(0, 2)}/${newValue.slice(2)}`;
            } else if (newValue.length > 4) {
                newValue = `${newValue.slice(0, 2)}/${newValue.slice(2, 4)}/${newValue.slice(4, 8)}`;
            }
            break;
            case 'valor':
                // Limitar a números y permitir la coma para decimales
                newValue = newValue.replace(/[^\d,]/g, ''); // Permitir solo dígitos y coma
                if (newValue) {
                    // Verificar si ya hay una coma en el valor
                    const parts = newValue.split(',');
                    
                    // Formatear la parte entera con puntos cada mil
                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                    
                    // Si hay una parte decimal, unir las partes con una coma
                    newValue = parts.join(',');
                }
                break;
            
        default:
            break;
    }

    return newValue;
};


export const handleChange = async (event, setInputs, inputs, setEditMode, options, infos) => {
    const { name, value } = event.target;
    const validatedValue = validateInput(name, value);
    let updatedInputs = { ...inputs, [name]: validatedValue };


    if (name === 'cliente' || name === 'vendedor') {
        let numericValue = value.replace(/\D/g, '');
        if (name === 'cliente') {
            if (numericValue.length > 5) {
                numericValue = numericValue.slice(0, 5);
            }
            updatedInputs = { ...updatedInputs, clienteNum: numericValue };
        } else if (name === 'vendedor') {
            if (numericValue.length > 3) {
                numericValue = numericValue.slice(0, 3);
            }
            updatedInputs = { ...updatedInputs, vendedorNum: numericValue };
        }
    }

    setInputs(updatedInputs);


    if (name === "factura" || name === "remision") {
        await getData(event.target, setInputs, setEditMode, options, infos, updatedInputs);
    }


};

const convertirDatosATexto = (filteredInfos) => {
    let texto = 'Remision\tCliente-Nombre\tObservacion\n'; // Encabezados

    // Recorrer el array y convertir cada objeto en una línea de texto
    filteredInfos.forEach(info => {
        let { factura, remision, cliente, clienteName, vendedor ,valor, deposito, observacion} = info;
        const estadoString = info.estado[info.estado.length - 1];
        const fechasString = info.hora[info.hora.length - 1]
        deposito == 1? deposito = "CENTRO" : deposito = "KM10"
        texto += `${remision} ; \t ${clienteName} ; \t ${observacion}  \n`;
    });

    return texto;
};

export const descargarTxt = (filteredInfos) => {
    const texto = convertirDatosATexto(filteredInfos); // Convertir datos a texto plano
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' }); // Crear blob
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'datos_infos.txt';
    a.click();
    URL.revokeObjectURL(url);
};

export function calcularTiempoTranscurrido(fechas) {
    const fechasConvertidas = fechas.hora.map(fecha => moment(fecha, "D/M/YYYY HH:mm"));
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
    let swit = 0
    fechas.estado.map((e) => {
        if (e == "Contable Recibido" || e == "Cancelar Nota") {
            swit++
        }
    })
    if (swit != 0) {
        if (horas == 0) {
            return "< 1 Hora"
        } else {
            return `${dias} días y ${horas} horas`;
        }

    } else {
        return ""
    }


}