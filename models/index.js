const Sequelize = require('sequelize');
const db = new Sequelize('postgres://localhost:5432/wikistack', {
    logging: false
});

const Page = db.define('page', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    urlTitle: {
        type: Sequelize.STRING,
        allowNull: false
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM('open', 'closed')
    },
    tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        set: function (tags) {

            tags = tags || [];

            if (typeof tags === 'string') {
                tags = tags.split(',').map(function (str) {
                    return str.trim();
                });
            }

            this.setDataValue('tags', tags);

        }
    }
}, {
        hooks: {
            beforeValidate: function(page) {
                if (page.title) {
                    page.urlTitle = page.title.replace(/\s+/g, '_').replace(/\W/g, '');
                } else {
                    page.urlTitle = Math.random().toString(36).substring(2, 7);
                }
            }
        },
        getterMethods: {
            route: function() {
                return '/wiki/' + this.urlTitle;
            }
        },
        classMethods: {
            findByTag: function (tag) {
                return this.findAll({
                    where: {
                        tags: {
                            $contains: [tag]
                        }
                    }
                });
            }
        },
        instanceMethods: {
            findSimilar: function () {
                return Page.findAll({
                    where: {
                        id: {
                            $ne: this.id
                        },
                        tags: {
                            $overlap: this.tags
                        }
                    }
                });
            }
        }
    }
);

const User = db.define('user', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    }
});

Page.belongsTo(User, { as: 'author' });

module.exports = {
    Page: Page,
    User: User
};
