// In-memory fake backend used only in demo mode (EXPO_PUBLIC_DEMO=1).
// Nothing is saved: reloading the app resets the sample data.

const daysAgo = (n) => {
  const d = new Date(Date.now() - n * 86400000);
  return { toDate: () => d, _ms: d.getTime() };
};

export const accounts = {
  'admin@demo.com': { password: 'demo123', uid: 'u-admin' },
  'member@demo.com': { password: 'demo123', uid: 'u-priya' },
};

export const data = {
  meta: { setup: { done: true } },
  users: {
    'u-admin': { name: 'Admin User', email: 'admin@demo.com', role: 'admin', active: true },
    'u-priya': { name: 'Priya Sharma', email: 'member@demo.com', role: 'member', active: true },
    'u-rahul': { name: 'Rahul Mehta', email: 'rahul@demo.com', role: 'member', active: true },
    'u-anita': { name: 'Anita Desai', email: 'anita@demo.com', role: 'member', active: false },
  },
  documents: {
    d1: {
      title: 'Client contract – Acme Pvt Ltd',
      category: 'Legal',
      notes: 'Signed annual service agreement. Renewal due in March.',
      fileName: 'Acme_contract_2026.pdf',
      fileSize: 482133,
      mimeType: 'application/pdf',
      fileUrl: 'https://example.com/Acme_contract_2026.pdf',
      createdBy: 'u-admin',
      createdByName: 'Admin User',
      createdAt: daysAgo(1),
    },
    d2: {
      title: 'October salary sheet',
      category: 'Finance',
      notes: 'Final payroll for October, approved by accounts.',
      fileName: 'salary_oct_2026.xlsx',
      fileSize: 91204,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileUrl: 'https://example.com/salary_oct_2026.xlsx',
      createdBy: 'u-priya',
      createdByName: 'Priya Sharma',
      createdAt: daysAgo(2),
    },
    d3: {
      title: 'Site photos – Warehouse',
      category: 'Projects',
      notes: 'Photos from the site visit on Monday.',
      fileName: 'warehouse_site.jpg',
      fileSize: 2310044,
      mimeType: 'image/jpeg',
      fileUrl: 'https://example.com/warehouse_site.jpg',
      createdBy: 'u-rahul',
      createdByName: 'Rahul Mehta',
      createdAt: daysAgo(4),
    },
    d4: {
      title: 'Leave policy',
      category: 'HR',
      notes: '18 paid leaves per year. Apply at least 3 days in advance through your manager.',
      createdBy: 'u-admin',
      createdByName: 'Admin User',
      createdAt: daysAgo(9),
    },
    d5: {
      title: 'Vendor contact list',
      category: 'Clients',
      notes: 'Printing: Shree Graphics\nCourier: FastShip\nIT support: NetCare',
      createdBy: 'u-priya',
      createdByName: 'Priya Sharma',
      createdAt: daysAgo(15),
    },
  },
};

const listeners = new Set();
export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const notify = () => setTimeout(() => listeners.forEach((fn) => fn()), 0);

let counter = 100;
export const newId = (prefix = 'id') => `${prefix}-${++counter}`;
export const now = () => {
  const d = new Date();
  return { toDate: () => d, _ms: d.getTime() };
};
