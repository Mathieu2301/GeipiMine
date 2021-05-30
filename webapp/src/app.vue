<template>
  <div>
    <div class="header">
      Geipi classement
    </div>

    <div class="content">
      <div class="marged">
        <input
          class="searchBox"
          type="text"
          v-model="searchText"
          placeholder="Rechercher..."
          autocomplete="keyword"
        >

        <div class="tableGrid">
          <div>Résultats</div><div>{{ global.nbr }}</div>
          <div>Moyenne Oral</div><div>{{ global.oral }} /20</div>
          <div>Moyenne Maths</div><div>{{ global.maths }} /20</div>
          <div>Moyenne Spé</div><div>{{ global.spec }} /20</div>
        </div>
      </div>

      <v-grid
        theme="darkCompact"
        :columns="columns"
        :source="list"
        :grouping="grouping"
        :autoSizeColumn="{ mode: 'autoSizeAll' }"
        filter="true"
        resize="true"
        readonly="true"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
import VGrid from '@revolist/vue3-datagrid';

export default {
  name: 'GeipiClassement',
  components: { VGrid },

  data: () => ({
    users: JSON.parse(localStorage.getItem('userList') || '[]'),
    searchText: '',

    columns: [
      { prop: 'id', name: 'ID Parcoursup', sortable: true, size: 85, pin: 'colPinStart' },
      { prop: 'nom', name: 'Nom', sortable: true, size: 120, pin: 'colPinStart' },
      { prop: 'prenom', name: 'Prénom', sortable: true, size: 110, pin: 'colPinStart' },
      { prop: 'oralMark', name: 'Oral', size: 85, sortable: true },
      { prop: 'mathsMark', name: 'Maths', size: 95, sortable: true },
      { prop: 'specMark', name: 'Spé', size: 80, sortable: true },
      { prop: 'spec', name: 'Spécialité', size: 200, sortable: true },
      { prop: 'date', name: 'Heure de convocation', size: 110, sortable: true },
      { prop: 'center', name: 'Centre d\'examen', size: 300, sortable: true },
      { prop: 'room', name: 'Salle d\'examen', size: 120, sortable: true },
      { prop: 'coord', name: 'Coordonnées', autoSize: true, sortable: true },
    ],

    grouping: {
      props: ['type'],
      expandedAll: true,
    },
  }),

  created() {
    this.fetch();
    setInterval(this.fetch, 60000);
  },

  computed: {
    list() {
      return this.users.filter(this.searchFilter).map((u) => {
        let type = 'Absents';
        if (u.oralMark !== null) type = 'Convoqués à l\'oral';
        if (u.mathsMark !== null || u.specMark !== null) type = 'Convoqués au concours';

        return {
          id: u.id || '-',
          prenom: u.prenom || '-',
          nom: u.nom || '-',
          type,
          oralMark: (u.oralMark ? this.rnd(u.oralMark) : '-'),
          mathsMark: (u.mathsMark ? this.rnd(u.mathsMark) : '-'),
          specMark: (u.specMark ? this.rnd(u.specMark) : '-'),
          spec: u.spec || '-',
          date: (u.date ? u.date.split('de ').pop().replace('à', '-').replace(/00/g, '') : '-'),
          coord: u.coord || '-',
          center: u.center || '-',
          room: u.room || '-',
        };
      });
    },

    global() {
      const global = {
        nbr: 0,

        nbrO: 0,
        oral: 0,

        nbrM: 0,
        maths: 0,

        nbrS: 0,
        spec: 0,
      };

      this.list.forEach((u) => {
        global.nbr += 1;

        if (u.oralMark !== '-') {
          global.nbrO += 1;
          global.oral += u.oralMark;
        }

        if (u.mathsMark !== '-') {
          global.nbrM += 1;
          global.maths += u.mathsMark;
        }

        if (u.specMark !== '-') {
          global.nbrS += 1;
          global.spec += u.specMark;
        }
      });

      global.oral = this.formatNumber(global.oral / global.nbrO);
      global.maths = this.formatNumber(global.maths / global.nbrM);
      global.spec = this.formatNumber(global.spec / global.nbrS);

      return global;
    },
  },

  methods: {
    async fetch() {
      this.users = await (await fetch('https://geipimine.usp-3.fr/fetch')).json();
      localStorage.setItem('userList', JSON.stringify(this.users));
    },

    rnd(val) {
      return Math.round(val * 100) / 100;
    },

    formatNumber(val) {
      return new Intl.NumberFormat(navigator.languages, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Math.abs(val || 0));
    },

    searchFilter(v) {
      const srh = this.searchText.toUpperCase();
      return `${v.id}`.startsWith(srh)
        || v.nom.includes(srh)
        || v.prenom.toUpperCase().includes(srh)
        || `${v.oralMark}`.includes(srh)
        || `${v.mathsMark}`.includes(srh)
        || `${v.specMark}`.includes(srh)
        || (v.spec || '').toUpperCase().includes(srh)
        || (v.date || '').toUpperCase().includes(srh)
        || (v.coord || '').toUpperCase().includes(srh)
        || (v.center || '').toUpperCase().includes(srh)
        || (v.room || '').toUpperCase().includes(srh);
    },
  },
};
</script>

<style>
:root {
  --color1: #ddd;
  --color2: #131722;
  --color3: #1e222d;
  --color4: #434651;
  --color5: #fe4282;
  --color6: #fc6f0f;
  --color7: #1a6dc5;
  --color7-s: #208fe6;
  --color8: #0da371;
  --color8-s: #1ab581;
  --font: #fff;
  --lightFont: #e7e7e7;
  --green: #0da371;
  --yellow: #ecb317;
  --orange: #fc6f0f;
  --red: #e03737;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 17px;
  margin: 0;
  background-color: var(--color2);
}

body * {
  color: var(--font);
  font-family: Questrial, Arial, sans-serif;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  text-shadow: 0 0 2px #00000020;
}

i { font-style: normal }

body *:not(input),
body input[type=submit] { user-select: none }
::placeholder { color: #838383 }

.header {
  position: fixed;
  background-color: var(--color3);
  top: 0;
  left: 0;
  right: 0;
  font-size: 28px;
  padding: 15px 0;
}

.content {
  margin-top: 80px;
  height: calc(100vh - 80px);
}

.marged {
  padding: 0 20px;
}

.tableGrid {
  margin: 30px auto;
  width: 100%;
  max-width: 300px;
  display: grid;
  grid-template-columns: auto auto;
  text-align: left;
  border: 1px solid var(--color4);
  border-bottom: none;
  border-right: none;
}

.tableGrid div {
  padding: 10px;
  border: 1px solid var(--color4);
  border-top: none;
  border-left: none;
}

.searchBox {
  background-color: transparent;
  width: 100%;
  max-width: 800px;
  min-width: 0;
  margin: 0 auto;
  padding: 12px;
  font-size: 18px;
  outline: none;
  display: grid;
  align-items: center;
  border: solid 2px var(--color1);
  border-radius: 15px;
}

.searchBox:focus, .searchBox:hover {
  border: solid 2px var(--color8-s);
}

revo-grid {
  height: calc(100% - 265px);
}

revogr-filter-panel {
  background-color: #2f3038;
}

revogr-filter-panel label { color: var(--lightFont) }
revogr-filter-panel button { color: var(--font) !important }
.revo-button.green { background-color: var(--color7); border-color: var(--color7-s); }
.select-css {
  color: var(--lightFont) !important;
  background-color: transparent;
  background-image: url(data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E), linear-gradient(to bottom, #00000000 0%, #00000000 100%);
}

revogr-filter-panel input {
  background-color: transparent !important;
  border: solid 1px !important;
}

.select-css option {
  background-color: var(--color4);
}
</style>
