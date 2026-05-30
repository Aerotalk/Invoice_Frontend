import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ClientsList } from './src/features/clients/pages/ClientsList';

try {
  const html = renderToString(
    <MemoryRouter>
      <ClientsList />
    </MemoryRouter>
  );
  console.log("Render successful!");
} catch (error) {
  console.error("Render failed:", error);
}
