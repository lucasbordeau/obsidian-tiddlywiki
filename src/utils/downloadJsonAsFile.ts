export function downloadJsonAsFile(jsonObject: any, fileName: string) {
	const jsonString = JSON.stringify(jsonObject, null, 2);
	const blob = new Blob([jsonString], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	a.click();
	URL.revokeObjectURL(url);
}
