const files = new Map();

export const getStorage = () => ({});
export const ref = (_storage, path) => ({ fullPath: path });

export function uploadBytesResumable(fileRef, blob) {
  const total = blob.size || 1;
  const task = {
    snapshot: { ref: fileRef, bytesTransferred: 0, totalBytes: total },
    on(_event, progress, _error, complete) {
      let step = 0;
      const timer = setInterval(() => {
        step += 1;
        task.snapshot.bytesTransferred = Math.min(total, (total * step) / 5);
        progress(task.snapshot);
        if (step >= 5) {
          clearInterval(timer);
          files.set(fileRef.fullPath, typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(blob) : '');
          complete();
        }
      }, 150);
    },
  };
  return task;
}

export const getDownloadURL = async (fileRef) => files.get(fileRef.fullPath) || '';
export const deleteObject = async (fileRef) => {
  files.delete(fileRef.fullPath);
};
