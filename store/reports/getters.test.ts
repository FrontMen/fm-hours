import getters from './getters';

describe('getters - totals', () => {
  const state = {
    reportData: {
      nonBillableProjects: [
        {
          id: 1,
          name: 'Project 1',
          isBillable: false,
          isDefault: false,
        },
        {
          id: 'IbiI0mriA6to1Nh0VWMM',
          isBillable: false,
          contract: {
            closed: null,
            jira_id: 69468,
            project_name: 'Intracto - INTERN - Consultancy NL non-billable',
            project_billingentity_name: null,
            billingcontact_id: 5885,
            group_name: null,
            project_id: 9322,
            project_jira_id: '31059',
            name: 'Googleday',
            project_key: 'NONBIL',
            project_billingentity_id: null,
            project_brand_id: '1488',
            id: 45797,
            company_id: 189,
            billingcontact_name: null,
            company_name: 'iO on-site B.V.',
          },
          isDefault: true,
          name: 'Googleday',
        },
        {
          id: 'mvgUB6UzkFTgH1BE0u1T',
          isBillable: false,
          debtor: '',
          isDefault: true,
          name: 'Another one',
        },
        {
          id: 'y0wwrS37PsqrDn6gIc5E',
          isDefault: true,
          name: 'default customer test',
          isBillable: false,
          debtor: '',
        },
      ],
      employees: [
        {
          name: 'John Doe',
          team: 'Team 1',
          billable: true,
          nonBillableRecords: [],
          billableRecords: [
            {
              customer: {id: 1, name: 'Customer 1'},
              hours: 5,
            },
            {
              customer: {id: 2, name: 'Customer 2'},
              hours: 3,
            },
            {
              customer: {id: 1, name: 'Customer 1'},
              hours: 2,
            },
          ],
        },
        {
          name: 'Jane Doe',
          team: 'Team 1',
          billable: true,
          nonBillableRecords: [],
          billableRecords: [
            {
              customer: {id: 2, name: 'Customer 2'},
              hours: 2,
            },
          ],
        },
        {
          name: 'John Doe',
          team: 'Team 2',
          billable: false,
          nonBillableRecords: [],
          billableRecords: [],
        },
      ],
    },
  };

  it('should return the totals fields', () => {
    // @ts-ignore
    expect(getters.totalsFields(state)).toEqual([
      {key: 'name', sortable: true},
      {key: 'team', sortable: true},
      {key: 'totalHours', sortable: true, variant: 'info'},
      {key: 'billable', sortable: true, variant: 'success'},
      {key: 'nonBillable', sortable: true, variant: 'warning'},
      {key: 'Project 1', sortable: true},
      {key: 'Googleday', sortable: true},
      {key: 'Another one', sortable: true},
      {key: 'default customer test', sortable: true},
      {key: 'productivity', sortable: true, variant: 'info'},
    ]);
  });

  // @ts-ignore
  expect(getters.totalsItems(state)).toEqual([
    {
      name: 'John Doe',
      team: 'Team 1',
      totalHours: 10,
      billable: 10,
      nonBillable: 0,
      'Project 1': 0,
      Googleday: 0,
      'Another one': 0,
      'default customer test': 0,
      productivity: '100%',
    },
    {
      name: 'Jane Doe',
      team: 'Team 1',
      totalHours: 2,
      billable: 2,
      nonBillable: 0,
      'Project 1': 0,
      Googleday: 0,
      'Another one': 0,
      'default customer test': 0,
      productivity: '100%',
    },
  ]);
});

describe('getters - Employee projects', () => {
  it('should return project fields', () => {
    // @ts-ignore
    expect(getters.projectFields()).toEqual([
      {key: 'name', sortable: true},
      {key: 'team', sortable: true},
      {key: 'project', sortable: true},
      {key: 'billable', sortable: true, variant: 'success'},
    ]);
  });

  it('should return project items', () => {
    // @ts-ignore
    expect(getters.projectItems({reportData: {employees: []}})).toEqual([]);

    const report = {
      employees: [
        {
          name: 'John Doe',
          team: 'Team 1',
          billable: true,
          billableRecords: [
            {
              customer: {id: 1, name: 'Customer 1'},
              hours: 5,
            },
            {
              customer: {id: 2, name: 'Customer 2'},
              hours: 3,
            },
            {
              customer: {id: 1, name: 'Customer 1'},
              hours: 2,
            },
          ],
        },
        {
          name: 'Jane Doe',
          team: 'Team 1',
          billable: true,
          billableRecords: [
            {
              customer: {id: 2, name: 'Customer 2'},
              hours: 2,
            },
          ],
        },
        {
          name: 'John Doe',
          team: 'Team 2',
          billable: false,
          billableRecords: [],
        },
      ],
    };

    // @ts-ignore
    expect(getters.projectItems({reportData: report})).toEqual([
      {
        name: 'John Doe',
        team: 'Team 1',
        billable: 7,
        project: 'Customer 1',
      },
      {
        name: 'John Doe',
        team: 'Team 1',
        billable: 3,
        project: 'Customer 2',
      },
      {
        name: 'Jane Doe',
        team: 'Team 1',
        billable: 2,
        project: 'Customer 2',
      },
    ]);
  });
});

describe('getters - kilometer reimbursement', () => {
  it('should return kilometer reimbursement fields', () => {
    // @ts-ignore
    expect(getters.kilometerFields()).toEqual([
      {key: 'name', sortable: true},
      {key: 'bridgeUid', sortable: false},
      {key: 'team', sortable: true},
      {key: 'kilometers', sortable: true},
    ]);
  });

  it('should return kilometer reimbursement items', () => {
    // @ts-ignore
    expect(getters.kilometerItems({reportData: {employees: []}})).toEqual([]);

    const state = {
      reportData: {
        employees: [
          {
            name: 'Jane Doe',
            bridgeUid: '456789',
            team: 'Team B',
            billable: true,
            billableRecords: [],
            nonBillableRecords: [],
            travelRecords: [
              {
                kilometers: 0,
                date: '2022-01-01',
                start: '08:00',
                end: '09:00',
                description: 'Travel to customer',
              },
            ],
          },
          {
            name: 'John Doe',
            bridgeUid: '123456',
            team: 'Team A',
            billable: true,
            billableRecords: [],
            nonBillableRecords: [],
            travelRecords: [
              {
                kilometers: 10,
                date: '2021-01-01',
                start: '08:00',
                end: '09:00',
                description: 'Travel to customer',
              },
            ],
          },
        ],
      },
    };

    // @ts-ignore
    expect(getters.kilometerItems(state)).toEqual([
      {
        name: 'John Doe',
        bridgeUid: '123456',
        team: 'Team A',
        kilometers: 10,
      },
    ]);
  });
});
describe('getters - stand-by hours', () => {
  it('should return stand-by fields', () => {
    // @ts-ignore
    expect(getters.standByFields()).toEqual([
      {key: 'name', sortable: true},
      {key: 'bridgeUid', sortable: false},
      {key: 'team', sortable: true},
      {key: 'hours', sortable: true},
    ]);
  });

  it('should return stand-by items', () => {
    // @ts-ignore
    expect(getters.standByItems({reportData: {employees: []}})).toEqual([]);

    const state = {
      reportData: {
        employees: [
          {
            name: 'John Doe',
            bridgeUid: '123',
            team: 'Team 1',
            billable: true,
            standByRecords: [{hours: 2}, {hours: 3}],
          },
          {
            name: 'Jane Doe',
            bridgeUid: '456',
            team: 'Team 2',
            billable: false,
            standByRecords: [{hours: 1}, {hours: 2}],
          },
        ],
      },
    };

    // @ts-ignore
    expect(getters.standByItems(state)).toEqual([
      {
        name: 'John Doe',
        bridgeUid: '123',
        team: 'Team 1',
        hours: 5,
      },
    ]);
  });
});

describe('getters - non-billable hours', () => {
  it('should return nonBillableFields', () => {
    // @ts-ignore
    expect(getters.nonBillableFields()).toEqual([
      {key: 'name', sortable: true},
      {key: 'team', sortable: true},
    ]);
  });

  it('should return nonBillableItems', () => {
    // @ts-ignore
    expect(getters.nonBillableItems({reportData: {employees: []}})).toEqual([]);

    // @ts-ignore
    expect(
      getters.nonBillableItems({
        reportData: {
          employees: [
            {
              name: 'John Doe',
              team: 'Team 1',
              billable: true,
            },
            {
              name: 'Jane Doe',
              team: 'Team 2',
              billable: false,
            },
          ],
        },
      })
    ).toEqual([
      {
        name: 'Jane Doe',
        team: 'Team 2',
      },
    ]);
  });
});
