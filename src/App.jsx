import AgregarDa from "./pages/AgregarDatos.jsx";
import ListaGral from "./pages/ListaGral.jsx";
import Inicio from "./pages/InicioSesion.jsx";
import { Routes, Route } from "react-router-dom";
import AuthProvider from "../context/AuthContext.jsx";
import RegistrarUser from "./pages/RegistrarUser.jsx";
import Excel from "./pages/Excel.jsx";
import { useState, useEffect } from "react";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase.js";
import { useLocalStorage } from "./CustomHooks/useLocalStorage.js";
import Loading from "./Loading/Loading.jsx";
import InicioSesion from "./pages/InicioSesion.jsx";

function App() {
  const [seller, setSeller] = useLocalStorage("vendedores", []);
  const [client, setClient] = useLocalStorage("clientes", []);
  const [infos, setInfos] = useState("");

  useEffect(() => {
    const unsubscribeDatos = onSnapshot(collection(db, "datos"), (snapshot) => {
      const allData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

      // Calculate date 3 months ago
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      // Filter data for documents with hora[0] that isn't older than 3 months
      const filteredData = allData.filter(doc => {
        // Check if hora exists and has at least one element
        if (doc.hora && doc.hora.length > 0) {
          const docDate = new Date(doc.hora[0]);
          return docDate >= threeMonthsAgo;
        }
        return false; // Exclude docs without proper hora data
      });

      console.log("Datos Cargados (filtrados por 3 meses)");

      setInfos((prevInfos) => {
        if (JSON.stringify(prevInfos) !== JSON.stringify(filteredData)) {
          return filteredData;
        }
        return prevInfos;
      });
    });

    return () => unsubscribeDatos();
  }, []);// Ejecuta solo una vez al montar


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
          <Route path="/imprimirentre" element={<RegistrarUser />} />

          <Route path="/registraruser" element={<RegistrarUser />} />
          <Route path="/excel" element={<Excel />} />
          <Route path="*" element={<InicioSesion />} />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
