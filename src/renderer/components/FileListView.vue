<template>
    <v-layout>
        <v-flex xs12>
            <v-data-table :headers="headers" :items="files" class="elevation-1">
                <template slot="items" slot-scope="props">
                  <td>{{ props.item.no }}</td>
                  <td class="text-xs-right">{{ props.item.type }}</td>
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
                        align: 'right',
                        sortable: false,
                        value: 'name'
                    },
                    {
                        text: 'Type',
                        value: 'type'
                    },
                    {
                        text: 'Hash',
                        value: 'hash'
                    },
                    {
                        text: 'Size',
                        value: 'size'
                    }
                ],
                files: [
                    {
                        value: false,
                        no: 1,
                        type: 'Unknown',
                        hash: '4C1CAA0F730DFF9CC83DD90D0F8618AD924AB5E7D94D42B329F9D5FFF5DDC227',
                        size: 30000
                    },
                    {
                        value: false,
                        no: 2,
                        type: 'Unknown',
                        hash: '4C1CAA0F730DFF9CC83DD90D0F8618AD924AB5E7D94D42B329F9D5FFF5DDC227',
                        size: 30000
                    },
                    {
                        value: false,
                        no: 3,
                        type: 'Unknown',
                        hash: '4C1CAA0F730DFF9CC83DD90D0F8618AD924AB5E7D94D42B329F9D5FFF5DDC227',
                        size: 30000
                    },
                    {
                        value: false,
                        no: 4,
                        type: 'Unknown',
                        hash: '4C1CAA0F730DFF9CC83DD90D0F8618AD924AB5E7D94D42B329F9D5FFF5DDC227',
                        size: 30000
                    },
                    {
                        value: false,
                        no: 5,
                        type: 'Unknown',
                        hash: '4C1CAA0F730DFF9CC83DD90D0F8618AD924AB5E7D94D42B329F9D5FFF5DDC227',
                        size: 30000
                    },
                    {
                        value: false,
                        no: 6,
                        type: 'Unknown',
                        hash: '4C1CAA0F730DFF9CC83DD90D0F8618AD924AB5E7D94D42B329F9D5FFF5DDC227',
                        size: 30000
                    }
                ]
            }
        }
    }
</script>