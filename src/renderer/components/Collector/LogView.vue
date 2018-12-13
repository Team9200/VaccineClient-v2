<template>
    <v-layout>
        <h1 id="h1-log">Log</h1>
        <!-- <p v-text="log"></p> -->
        <table id='tbl-log'>
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Event Type</th>
                    <th>Detail</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, i) in log" :key="i">
                    <td>{{ item.timestamp }}</td>
                    <td>{{ item.type }}</td>
                    <td>{{ item.data }}</td>
                </tr>
            </tbody>
        </table>
    </v-layout>
</template>

<script>
export default {
    name: 'log-view',
    data: () => {
        return { 
            log: new Array(),
        }
    },
    methods: {
        // getLog() {
        //     ipcRenderer.send('getLog');
        // }
    },
    mounted () { 
        this.$electron.ipcRenderer.send('getLog');
        this.$electron.ipcRenderer.on('log', (event, message) => {
            const log = JSON.parse(message);
            this.log = log;
            console.log(this.log);
        });
    }
}
</script>
<style>
    #h1-log{
        position: relative;
        height: 100px;
    }

    #tbl-log {
        position: absolute;
        top: 40px;
        background: #eee;
        border-collapse: separate;
        box-shadow: inset 0 1px 0 #fff;
        font-size: 12px;
        line-height: 24px;
        margin: 30px auto;
        text-align: left;
        width: 650px;
    }	

    #tbl-log th {
        background: #444;
        border-left: 1px solid #555;
        border-right: 1px solid #777;
        border-top: 1px solid #555;
        border-bottom: 1px solid #333;
        box-shadow: inset 0 1px 0 #999;
        color: #fff;
        font-weight: bold;
        padding-left: 15px;
        position: relative;
        text-shadow: 0 1px 0 #000;	
    }

    #tbl-log td {
        border-right: 1px solid #fff;
        border-left: 1px solid #e8e8e8;
        border-top: 1px solid #fff;
        border-bottom: 1px solid #e8e8e8;
        position: relative;
        padding-left: 15px;
        color: #333;
        transition: all 300ms;
    }


</style>