<template>
    <v-layout>
        <v-flex xs12>
            <h1>File List</h1>
            <v-data-table :headers="headers" :items="files" class="elevation-1">
                <template slot="items" slot-scope="props">
                  <td>{{ props.item.no }}</td>
                  <td class="text-xs-right">{{ props.item.hash }}</td>
                  <td class="text-xs-right">{{ props.item.size }}</td>
                </template>
            </v-data-table>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: 'file-list-view',
        data() {
            return {
                headers: [{
                        text: 'no',
                        align: 'center',
                        sortable: false,
                        value: 'name'
                    },
                    {
                        text: 'Hash (SHA256)',
                        align: 'center',
                        value: 'hash'
                    },
                    {
                        text: 'Size',
                        align: 'center',
                        value: 'size'
                    }
                ],
                files: []
            }
        },
        mounted() {
            const vm = this;
            var path = require('path');
            var fs = require('fs');
            var no = 1;
            var filePath = path.join(__dirname, '../../../../header.json');
            var fileList = fs.readFileSync(filePath, 'utf-8');
            var data = JSON.parse(fileList);
            data.some(function(res){
                console.log(res.sha256);
                vm.files.push({value: false, no: no, hash: res.sha256, size: res.size});
                no = no + 1;
            });
            this.$electron.ipcRenderer.send('getFSFileListREQ');
        }
    }
</script>