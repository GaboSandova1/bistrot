// Agregando la conexion a la base de datos
import mysql from 'mysql2/promise'
import 'dotenv/config'

const DBConfig = {
  host: '127.0.0.1' || process.env.DB_HOST,
  user: 'root' || process.env.DB_USERNAME,
  port: 3306 || process.env.DB_PORT,
  password: '' || process.env.DB_PASSWORD,
  database: 'bistrot' || process.env.DB_DATABASE,
}

const connection = await mysql.createConnection(DBConfig)

//Crud de la tabla de los productos de compra

export class ComidaModel{

    //esta funcion filtra las comidas de la base de datos por el tipo_comida o tipo_bebida si los tiene, sino devuelve todas las comidas
    static async getAll ({tipo_comida , tipo_bebida}) {
        if(!tipo_bebida && !tipo_comida) {
            const [comidas] = await connection.query("SELECT * FROM comida")
            return comidas
        }
        let query = "SELECT * FROM comida WHERE ";
        const params = [];

        if (tipo_comida) {
            query += `tipo_comida = ?`;
            params.push(tipo_comida.toLowerCase())
        }

        if (tipo_bebida) {
            query += `tipo_bebida = ?`;
            params.push(tipo_bebida.toLowerCase())
        }

        const [comidas] = await connection.query(query , params);
        return comidas;
    }

    static async getForId({id}) {
        const [comidas] = await connection.query(
            "SELECT * FROM comida WHERE id = ?;" , [id]
        )
        return comidas
    }

    static async create({input}) {
        const {
            nombre,
            tipo_comida,
            tipo_bebida,
            instrumentos,
            ingredientes
        } = input
        try {
            await connection.query(
                "INSERT INTO comida (nombre , tipo_comida, tipo_bebida , instrumentos , ingredientes) VALUES (?,?,?,?,?);", [nombre , tipo_comida, tipo_bebida , instrumentos , ingredientes]
            )
            const [comida] = await connection.query("SELECT * FROM comida WHERE id = LAST_INSERT_ID()");
            return comida
        } catch (error) {
            throw new Error("Error creando una comida")
        }
        
    }

    static async delete({id}) {
        const connection = await mysql.createConnection(config);
        try {
            // Consulta SQL para eliminar la comida por ID
            const query = "DELETE FROM comida WHERE id = ?";
            const [result] = await connection.query(query, [id]);

            if (result.affectedRows > 0) {
                return { message: `Comida con id ${id} eliminada correctamente.` };
            } else {
                throw new Error(`No se encontró ninguna comida con id ${id}.`);
            }
        } catch (error) {
            console.error('Error al eliminar la comida:', error);
            throw error;
        } finally {
            await connection.end();
        }
    }

    static async update({id , input}) {
        const {
            nombre,
            tipo_comida,
            tipo_bebida,
            instrumentos,
            ingredientes
        } = input;

        const connection = await mysql.createConnection(config);

        try {
            // Construir la parte de la consulta SQL para actualizar
            let updates = [];
            let values = [];

            if (nombre) {
                updates.push("nombre = ?");
                values.push(nombre);
            }
            if (tipo_comida !== undefined && tipo_comida !== null) {
                updates.push("tipo_comida = ?");
                values.push(tipo_comida);
            }
            if (tipo_bebida !== undefined && tipo_bebida !== null) {
                updates.push("tipo_bebida = ?");
                values.push(tipo_bebida);
            }
            if (instrumentos) {
                updates.push("instrumentos = ?");
                values.push(instrumentos);
            }
            if (ingredientes) {
                updates.push("ingredientes = ?");
                values.push(ingredientes);
            }

            // Comprobar si hay campos para actualizar
            if (updates.length == 0) {
                throw new Error("No se proporcionaron datos para actualizar.");
            }

            // Agregar el ID como último valor en el array de values
            values.push(id);

            // Consulta SQL para actualizar
            const query = `UPDATE comida SET ${updates.join(', ')} WHERE id = ?`;
            const [result] = await connection.query(query, values);
            
            
            if (result.affectedRows > 0) {
                // Consulta para obtener la comida actualizada
                const selectQuery = "SELECT * FROM comida WHERE id = ?";
                const [updatedComida] = await connection.query(selectQuery, [id]);
                if (updatedComida.length === 0) {
                    throw new Error(`No se encontró comida con id ${id} después de la actualización.`);
                }
                return updatedComida[0];
            } else {
                return false
            }
        } catch (error) {
            console.error('Error al actualizar la comida:', error);
            throw error;
        } finally {
            await connection.end();
        }
    }

}