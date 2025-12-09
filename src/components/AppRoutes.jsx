// src/components/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Districts from './Districts';
import District from './District';
import Estate from './Estate';
import Apartment from './Apartment';
import Calculator from './Calculator';
import PersonalOfferStub from './PersonalOfferStub';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/districts" element={<Districts />} />
      <Route path="/district/:district" element={<District />} />
      <Route path="/estate/:district/:estate" element={<Estate />} />
      <Route path="/apartment/:id" element={<Apartment />} />
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/offer/:user_id" element={<PersonalOfferStub />} />
    </Routes>
  );
};

export default AppRoutes;