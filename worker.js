addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const queryParams = new URLSearchParams(url.searchParams);

    switch (path) {
        case '/data':
            return handleDataRequest(queryParams);
        case '/columns':
            return handleColumnsRequest();
        default:
            return new Response('Not Found', { status: 404 });
    }
}

async function handleDataRequest(queryParams) {
    // A lógica para tratar os filtros e a paginação vai aqui
    // Substitua 'countriesData' pelo seu JSON real ou faça uma chamada a um banco de dados/KV
    const data = JSON.parse(countriesData); // countriesData é uma string JSON do seu arquivo
    let filteredData = data;
    const page = parseInt(queryParams.get('page') || '1', 10);
    const limit = parseInt(queryParams.get('limit') || '10', 10);
    const filter = queryParams.get('filter');

    if (filter) {
        const filters = JSON.parse(filter);
        filteredData = applyFilters(data, filters);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return new Response(JSON.stringify({
        success: true,
        data: paginatedData,
        total: filteredData.length
    }), {
        headers: { 'Content-Type': 'application/json' },
    });
}

async function handleColumnsRequest() {
    const data = JSON.parse(countriesData); // Substitua 'countriesData' pela sua string JSON
    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    return new Response(JSON.stringify({
        success: true,
        data: columns,
        total: columns.length
    }), {
        headers: { 'Content-Type': 'application/json' },
    });
}

function applyFilters(data, filters) {
    return data.filter(item => {
        return filters.every(filter => {
            const itemValue = String(item[filter.field]).toLowerCase();
            const filterValue = String(filter.value).toLowerCase();

            switch (filter.operator) {
                case '=':
                    return itemValue === filterValue;
                case '!=':
                    return itemValue !== filterValue;
                case '>':
                    return itemValue > filterValue;
                case '>=':
                    return itemValue >= filterValue;
                case '<':
                    return itemValue < filterValue;
                case '<=':
                    return itemValue <= filterValue;
                case '*':
                case 'like':
                    return itemValue.includes(filterValue);
                default:
                    return true;
            }
        });
    });
}