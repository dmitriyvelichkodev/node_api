const PAGE_SIZE = 100;

module.exports = function(db) {
    const Relation = db.sequelize.define('Relation', {}, {
        timestamps: false,
        underscored: false,
    });

    const Organization = require('./organization.models')(db);

    Relation.belongsTo(Organization, {
            foreignKey: {name: 'parentName', allowNull: false},
            onDelete: 'CASCADE',
        });
    Relation.belongsTo(Organization, {
            foreignKey: {name: 'daughterName', allowNull: false},
            onDelete: 'CASCADE',
        });

    Relation.creating = (relationObj, transaction) => {
        if (!relationObj || !relationObj.parentName ||
                !relationObj.daughterName) {
            return Promise.resolve();
        }

        return Relation.findOrCreate({
                where: relationObj,
                transaction: transaction,
            })
            .spread((relation, created) => {

            });
    };

    Relation.gettingPaginated = function(targetName, pageNumber) {
        const sqlQuery = 'SELECT SQL_CALC_FOUND_ROWS *' +
            ' FROM (' +
            '  SELECT daughterName as \'org_name\',' +
            '         \'daughter\' as \'relationship_type\'' +
            '  FROM Relations' +
            '  WHERE parentName=:target_name' +
            '   UNION' +
            '  SELECT parentName as \'org_name\',' +
            '        \'parent\' as \'relationship_type\'' +
            '  FROM Relations' +
            '  WHERE daughterName=:target_name' +
            '   UNION' +
            '  SELECT daughterName as \'org_name\',' +
            '        \'sister\' as \'relationship_type\'' +
            '  FROM Relations' +
            '  WHERE parentName in ' +
            '   (SELECT parentName ' +
            '    FROM Relations ' +
            '    WHERE daughterName=:target_name) AND ' +
            '    daughterName != :target_name' +
            ' ) as relations' +
            ' ORDER BY \'org_name\'' +
            ' LIMIT :start, :size';

            return db.sequelize.query(sqlQuery, {
                    replacements: {
                        target_name: targetName,
                        start: (pageNumber - 1) * PAGE_SIZE,
                        size: PAGE_SIZE,
                    },
                    type: db.sequelize.QueryTypes.SELECT,
                })
            .then((relations) => {
                const sqlCountResult = 'SELECT FOUND_ROWS();';
                return db.sequelize.query(sqlCountResult, {
                        type: db.sequelize.QueryTypes.SELECT,
                    })
                    .then((foundRowsRes) => {
                        const count = foundRowsRes[0]['FOUND_ROWS()'];
                        return {
                            page: pageNumber,
                            per_page: PAGE_SIZE,
                            page_count: Math.ceil(count / PAGE_SIZE),
                            total_count: count,
                            records: relations,
                        };
                    });
            });
    };

    return Relation;
};
