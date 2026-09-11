export async function readFileObjectToJSON(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        if (typeof reader.result === 'string') {
          const jsonData = JSON.parse(reader.result);

          resolve(jsonData);
        } else {
          throw new Error(
            'readFileObjectToJSON : Unexpected reader result type.',
          );
        }
      } catch (error) {
        reject(new Error(`Error parsing JSON: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error(`Error reading file: ${reader.error?.message}`));
    };

    reader.readAsText(file);
  });
}
