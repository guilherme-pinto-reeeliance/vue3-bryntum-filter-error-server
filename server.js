const express = require('express');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = 3005;
const corsOptions = {
    origin: 'http://localhost:3000', // Substitua pela origem do seu cliente
    credentials: true, // Permite o envio de cookies e credenciais de autenticação
};

app.use(cors(corsOptions));


// Função para aplicar filtros
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

// Rota para buscar dados
app.get('/data', async (req, res) => {
    const { page = 1, limit = 10, filter } = req.query;

    try {
        const data = JSON.parse(await fs.readFile('countries.json', 'utf8'));
        let filteredData = data;

        // Aplica filtros se existirem
        if (filter) {
            const filters = JSON.parse(filter);
            filteredData = applyFilters(data, filters);
        }

        // Paginação
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: paginatedData,
            total: filteredData.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.get('/columns', async (req, res) => {
    try {
        // Carrega os dados do arquivo JSON
        const data = JSON.parse(await fs.readFile('countries.json', 'utf8'));

        // Assume que todos os objetos têm a mesma estrutura, então usa o primeiro item para determinar as chaves
        const columns = data.length > 0 ? Object.keys(data[0]) : [];

        // Retorna as colunas
        res.json({
            success: true,
            data: columns, // Retorna apenas os nomes das colunas
            total: columns.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
