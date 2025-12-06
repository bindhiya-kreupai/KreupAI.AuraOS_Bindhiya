export const handleValuesExport = (entityName: string) => {
    // Trigger download by opening the export URL in a new window/tab or setting window.location
    // Using window.location.href is standard for downloads
    window.location.href = `/api/master-data/${entityName}?export=csv`;
};
