import { data, newId, notify, now, subscribe } from './store';

export const initializeFirestore = () => ({});
export const getFirestore = () => ({});

export const collection = (_db, col) => ({ type: 'col', col });
export const doc = (_db, col, id) => ({ type: 'doc', col, id });
export const orderBy = (field, dir = 'asc') => ({ field, dir });
export const query = (colRef, ...order) => ({ ...colRef, order });
export const serverTimestamp = () => now();

const table = (col) => (data[col] ||= {});
const sortValue = (v) => (v && v._ms !== undefined ? v._ms : typeof v === 'string' ? v.toLowerCase() : v);

function docSnap(col, id) {
  const raw = table(col)[id];
  return { id, exists: () => !!raw, data: () => (raw ? { ...raw } : undefined) };
}

function querySnap(ref) {
  let docs = Object.keys(table(ref.col)).map((id) => docSnap(ref.col, id));
  for (const { field, dir } of ref.order || []) {
    docs.sort((a, b) => {
      const x = sortValue(a.data()[field]);
      const y = sortValue(b.data()[field]);
      return (x > y ? 1 : x < y ? -1 : 0) * (dir === 'desc' ? -1 : 1);
    });
  }
  return { docs, size: docs.length };
}

const snapshot = (ref) => (ref.type === 'doc' ? docSnap(ref.col, ref.id) : querySnap(ref));

export function onSnapshot(ref, next) {
  const emit = () => next(snapshot(ref));
  setTimeout(emit, 0);
  return subscribe(emit);
}

export const getDoc = async (ref) => snapshot(ref);
export const getCountFromServer = async (ref) => ({ data: () => ({ count: querySnap(ref).size }) });

export async function setDoc(ref, value) {
  table(ref.col)[ref.id] = { ...value };
  notify();
}
export async function addDoc(colRef, value) {
  const id = newId('d');
  await setDoc({ col: colRef.col, id }, value);
  return { id };
}
export async function updateDoc(ref, value) {
  table(ref.col)[ref.id] = { ...table(ref.col)[ref.id], ...value };
  notify();
}
export async function deleteDoc(ref) {
  delete table(ref.col)[ref.id];
  notify();
}

export function writeBatch() {
  const ops = [];
  return {
    set: (ref, value) => ops.push(() => setDoc(ref, value)),
    commit: async () => {
      for (const op of ops) await op();
    },
  };
}
