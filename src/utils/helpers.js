export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-LK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
};

export const getStatusColor = (status) => {
    switch (status) {
        case 'given': return 'text-green-600 bg-green-50';
        case 'missed': return 'text-red-600 bg-red-50';
        case 'pending': return 'text-yellow-600 bg-yellow-50';
        default: return 'text-gray-600 bg-gray-50';
    }
};

export const getSeverityColor = (severity) => {
    switch (severity) {
        case 'critical': return 'text-red-700 bg-red-100 border-red-300';
        case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
        case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
        default: return 'text-blue-700 bg-blue-100 border-blue-300';
    }
};