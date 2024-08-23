import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const FileUploader = () => {
  const [fileName, setFileName] = useState('');
  const [data, setData] = useState([])

  const handleFileChange =  (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Suponiendo que quieres procesar la primera hoja del archivo
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        jsonData.forEach(async (doc)=>{
            await addDoc(collection(db, "clientes"), doc)
        })
       
        // Mostrar los datos en la consola
        // await addDoc(collection(db, "clientes"), jsonData)
      };

      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept=".xlsx" 
        onChange={handleFileChange}
      />
      {fileName && <p>Archivo seleccionado: {fileName}</p>}
    </div>
  );
};

export default FileUploader;
