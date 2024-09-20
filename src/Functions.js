import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { ToastContainer, toast } from 'react-toastify';

export const getDateNow = () => {
    const date = new Date()
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    let h = date.getHours();
    let min = date.getMinutes();

    if (h - 10 < 0) {
        h = `0${h}`
    }
    return `${d}/${m}/${y} ${h}:${min}`;
}

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
        vendedor: "",
        estado: ['Facturado'],
        hora: [getDateNow()],
        deposito: "",
        valor: "",
        observacion: ""
    });

};

export const getData = async (e, setInputs, setEditMode) => {
    const querySnapshot = await getDocs(collection(db, "datos"));
    querySnapshot.docs.forEach((d) => {
        if (d.data().factura === e.value && e.name == "factura" && e.value != "") {
            setInputs({
                factura: d.data().factura,
                remision: d.data().remision,
                cliente: d.data().cliente,
                vendedor: d.data().vendedor,
                estado: d.data().estado,
                hora: d.data().hora,
                id: d.id
            })
            setEditMode(true)
        }
        if (d.data().remision === e.value && e.name == "remision") {
            setInputs({
                factura: d.data().factura,
                remision: d.data().remision,
                cliente: d.data().cliente,
                vendedor: d.data().vendedor,
                estado: d.data().estado,
                hora: d.data().hora,
                id: d.id
            })
            setEditMode(true)
        }

    })

};

const validateInput = (name, value) => {
    let newValue = value;

    switch (name) {
        case 'factura':
            // Limitar a letras, números y un guion en la posición correcta
            newValue = newValue.replace(/[^a-zA-Z0-9]/g, ''); // Remover cualquier carácter no alfanumérico
            if (newValue.length > 3) {
                newValue = `${newValue.slice(0, 3)}-${newValue.slice(3, 10)}`;
            }
            break;
        case 'cliente':
            // Limitar a números y máximo 5 caracteres
            newValue = newValue.replace(/\D/g, ''); // Remover cualquier carácter no numérico
            if (newValue.length > 5) {
                newValue = newValue.slice(0, 5);
            }
            break;
        case 'observacion':
            // Limitar a números y máximo 5 caracteres

            if (newValue.length > 50) {
                newValue = newValue.slice(0, 50);
            }
            break;
        case 'vendedor':
            // Limitar a números y máximo 3 caracteres
            newValue = newValue.replace(/\D/g, ''); // Remover cualquier carácter no numérico
            if (newValue.length > 3) {
                newValue = newValue.slice(0, 3);
            }
            break;
        case 'remision':
            // Limitar a números y máximo 7 caracteres
            newValue = newValue.replace(/\D/g, ''); // Remover cualquier carácter no numérico
            if (newValue.length > 7) {
                newValue = newValue.slice(0, 7);
            }
            break;
        default:
            break;
    }

    return newValue;
};

export const handleChange = async (event, setInputs, inputs, setEditMode) => {
    const { name, value } = event.target;
    const validatedValue = validateInput(name, value);
    setInputs({
        ...inputs,
        [name]: validatedValue,
    });
    if (event.target.name == "factura" || event.target.name == "remision") {
        await getData(event.target, setInputs, setEditMode)
    }

};



export const updateData = async (inputs, toast, setInputs, editMode, user) => {
    if (user.permission != "Admin") {
        editMode = true
    }
    console.log(inputs)
    if (inputs.remision != "" && inputs.estado) {
        await compareData(inputs);

        if (editMode) {
            await updateDoc(doc(db, "datos", inputs.id), inputs)
            toast.warning('Datos Editados correctamente', {
                autoClose: 1400
            });
            clearInputs(setInputs)
        } else if (!editMode && swit) {
            await addDoc(collection(db, "datos"), inputs)
            toast.success('Datos Añadidos correctamente', {
                autoClose: 1400
            });
            clearInputs(setInputs)
        } else {
            console.log(!editMode, swit)
            toast.error('Datos Iguales', {
                autoClose: 1400
            });
            clearInputs(setInputs)
        }
    } else {
        toast.error('Datos Vacios', {
            autoClose: 1400
        });
        clearInputs(setInputs)
    }



}


export const selectOption = (option, i, inputs, setInputs, setIsOpen) => {
    const options = ['Facturado', 'Deposito', 'Salida de Deposito', "Entregado", "Contable Recibido", "Cancelar Nota"];
    const tempOption = [...inputs.estado, option]
    const tempHour = [...inputs.hora, getDateNow()]

    const pastOption = option

    if (inputs.estado[inputs.estado.length - 1] != "Cancelar Nota") {
        setInputs({
            ...inputs,
            "estado": tempOption,
            "hora": tempHour
        })
    } else {
        toast.error('Esta nota ya ha sido cancelada', {
            autoClose: 1400
        });
    }


    setIsOpen(false);


};