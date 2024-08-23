import React from 'react';
import './Loading.css'; // Asegúrate de tener un archivo CSS para estilos

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">Cargando</p>
    </div>
  );
};

export default Loading;
