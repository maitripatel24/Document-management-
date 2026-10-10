import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../AuthContext';
import { Button, CATEGORIES, Chip, Input, formatSize, styles } from '../ui';

const MAX_SIZE = 50 * 1024 * 1024; // must match storage.rules

// Used both to add a new document and (with route.params.id) to edit an existing one.
export default function AddDocumentScreen({ navigation, route }) {
  const editId = route.params?.id;
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [existing, setExisting] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: editId ? 'Edit document' : 'Add document' });
    if (!editId) return;
    getDoc(doc(db, 'documents', editId)).then((s) => {
      const d = s.data();
      setExisting(d);
      setTitle(d.title || '');
      setCategory(d.category || 'General');
      setNotes(d.notes || '');
    });
  }, [editId]);

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
    if (res.canceled) return;
    const a = res.assets[0];
    if (a.size && a.size > MAX_SIZE) return Alert.alert('File too large', 'Maximum file size is 50 MB.');
    setFile(a);
    if (!title) setTitle(a.name.replace(/\.[^.]+$/, ''));
  };

  const uploadFile = async () => {
    const blob = await (await fetch(file.uri)).blob();
    const path = `documents/${user.uid}/${Date.now()}_${file.name.replace(/[^\w.\-]/g, '_')}`;
    const task = uploadBytesResumable(ref(storage, path), blob, {
      contentType: file.mimeType || 'application/octet-stream',
    });
    await new Promise((resolve, reject) =>
      task.on('state_changed', (s) => setProgress(s.bytesTransferred / s.totalBytes), reject, resolve)
    );
    return {
      fileUrl: await getDownloadURL(task.snapshot.ref),
      storagePath: path,
      fileName: file.name,
      fileSize: file.size || blob.size,
      mimeType: file.mimeType || '',
    };
  };

  const save = async () => {
    setError('');
    if (!title.trim()) return setError('Give the document a title.');
    if (!file && !notes.trim() && !existing?.fileUrl) return setError('Attach a file or write some notes.');
    setProgress(0);
    try {
      const fileData = file ? await uploadFile() : {};
      const data = { title: title.trim(), category, notes: notes.trim(), ...fileData };
      if (editId) {
        await updateDoc(doc(db, 'documents', editId), { ...data, updatedAt: serverTimestamp() });
        if (file && existing?.storagePath) {
          await deleteObject(ref(storage, existing.storagePath)).catch(() => {});
        }
      } else {
        await addDoc(collection(db, 'documents'), {
          ...data,
          createdBy: user.uid,
          createdByName: profile?.name || user.email,
          createdAt: serverTimestamp(),
        });
      }
      navigation.goBack();
    } catch (e) {
      setError(e.message);
      setProgress(null);
    }
  };

  const busy = progress !== null;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>File</Text>
      <View style={styles.card}>
        {file ? (
          <>
            <Text style={styles.h2} numberOfLines={2}>📎 {file.name}</Text>
            <Text style={styles.muted}>{formatSize(file.size)}</Text>
          </>
        ) : existing?.fileName ? (
          <Text style={styles.muted}>Current file: {existing.fileName}</Text>
        ) : (
          <Text style={styles.muted}>PDF, Word, Excel, images — any file up to 50 MB (optional)</Text>
        )}
        <Button
          title={file || existing?.fileName ? 'Choose a different file' : 'Choose file'}
          variant="outline"
          onPress={pickFile}
          disabled={busy}
          style={{ marginTop: 12 }}
        />
      </View>

      <Input label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Client contract – Acme" />

      <Text style={styles.label}>Category</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>

      <Input label="Notes / details" value={notes} onChangeText={setNotes} multiline placeholder="Any information to store with this document" />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        title={busy ? (file ? `Uploading ${Math.round(progress * 100)}%` : 'Saving…') : 'Save'}
        onPress={save}
        disabled={busy}
      />
    </ScrollView>
  );
}
