import AgregarDa from "./pages/AgregarDatos.jsx";
import ListaGral from "./pages/ListaGral.jsx";
import Inicio from "./pages/InicioSesion.jsx";
import { Routes, Route } from "react-router-dom";
import AuthProvider from "../context/AuthContext.jsx";
import RegistrarUser from "./pages/RegistrarUser.jsx";
import Excel from "./pages/Excel.jsx";
import { useState, useEffect } from "react";
import { collection, onSnapshot, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase.js";
import { useLocalStorage } from "./CustomHooks/useLocalStorage.js";
import { vendedores } from "./Vendedores.js";
import Loading from "./Loading/Loading.jsx";
import InicioSesion from "./pages/InicioSesion.jsx";

function App() {
  const [seller, setSeller] = useLocalStorage("vendedores", []);
  const [client, setClient] = useLocalStorage("clientes", []);
  const [infos, setInfos] = useState("");
  const [clientsLoaded, setClientsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribeDatos = onSnapshot(collection(db, "datos"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      console.log("Datos Cargados");
      
      setInfos((prevInfos) => {
        if (JSON.stringify(prevInfos) !== JSON.stringify(data)) {
          // Solo actualiza si los datos han cambiado
          return data;
        }
        return prevInfos;
      });
    });

    return () => unsubscribeDatos();
  }, []); // Ejecuta solo una vez al montar

  
  useEffect(() => {
    const getClient = async () => {
      const clientSnapshot = await getDocs(collection(db, "clientes"));
      const clientData = clientSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      console.log("Clientes Cargados")
      setClient(clientData);
    }
    getClient();
  }, []);

  useEffect(() => {
    const getSeller = async () => {
      const sellerSnapshot = await getDocs(collection(db, "vendedores"));
      const sellerData = sellerSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      console.log("Vendedores Cargados")
      setSeller(sellerData);

    }
    getSeller();
  }, []);

  useEffect(() => {
    if (client.length > 0 && infos.length > 0) {
      const updatedInfos = infos.map((docD) => {
        const matchingClient = client.find((docC) => docC["COD."] == docD.cliente);
        const matchingSeller = seller.find((docC) => docC.cod == docD.vendedor);

        const clienteName = matchingClient ? matchingClient.CLIENTES : "Cliente no encontrado";
        const vendedorName = matchingSeller ? matchingSeller.name : "Vendedor no encontrado";

        return {
          ...docD,
          clienteName: clienteName,
          VendedorName: vendedorName,
        };
      });

      // Evitar actualizaciones innecesarias al comparar antes de establecer el estado
      setInfos((prevInfos) => {
        if (JSON.stringify(prevInfos) !== JSON.stringify(updatedInfos)) {
          return updatedInfos;
        }
        return prevInfos;
      });
    }
  }, [client, infos]);

  return (
    <div className="w-screen h-screen overflow-x-hidden bg-transparent">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/AgregarDatos" element={<AgregarDa infos={infos} />} />
          <Route
            path="/Listagral"

            element={infos.length > 0 ? <ListaGral infos={infos} /> : <Loading />}
          />

          <Route path="/registraruser" element={<RegistrarUser />} />
          <Route path="/excel" element={<Excel />} />
          <Route path="*" element={<InicioSesion />} />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
