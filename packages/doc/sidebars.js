/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  // tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],

  // But you can create a sidebar manually

  tutorialSidebar: [
    'quickstart',
    'installation',
    {
      type: 'category',
      label: 'API Building',
      items: [
        {
          type: 'category',
          label: 'Configuration',
          link: { type: 'doc', id: 'api-building/configuration' },
          items: [
            {
              type: 'doc',
              id: 'api-building/configuration/data-api-schema',
            },
            {
              type: 'doc',
              id: 'api-building/configuration/data-source-profile',
            },
          ]
        },
        {
          type: 'doc',
          id: 'api-building/sql-template',
        },
        {
          type: 'doc',
          id: 'api-building/sql-builder',
        },
        {
          type: 'doc',
          id: 'api-building/build-from-dbt',
        },
        {
          type: 'doc',
          id: 'api-building/api-validation',
        },
        {
          type: 'doc',
          id: 'api-building/error-response',
        },
        {
          type: 'doc',
          id: 'api-building/api-document',
        },
        {
          type: 'category',
          label: 'Access Control',
          link: { type: 'doc', id: 'api-building/access-control' },
          items: [
            {
              type: 'category',
              label: 'Authenticator',
              link: { type: 'doc', id: 'api-building/access-control/authenticator' },
              items: [
                {
                  type: 'autogenerated',
                  dirName: 'api-building/access-control/authenticators',
                },
              ]
            },
            {
              type: 'doc',
              id: 'api-building/access-control/authorization'
            }
          ]
        },
        {
          type: 'doc',
          id: 'api-building/api-versioning',
        },
      ],
    },
    {
      type: 'category',
      label: 'Connectors',
      link: { type: 'doc', id: 'connectors' },
      items: [
        {
          type: 'doc',
          id: 'connectors/postgresql',
          label: 'PostgreSQL'
        },
        {
          type: 'doc',
          id: 'connectors/duckdb',
          label: 'DuckDB'
        },
      ]
    },
    'deployment',
  ],

};

module.exports = sidebars;
