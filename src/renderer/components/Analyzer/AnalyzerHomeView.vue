<template>
    <div>
        <v-layout>

            <v-flex xs8>
                <div style="padding-top: 10px;"></div>

                <v-card>
                    <v-container>
                        <v-data-table rows-per-page-items="2" v-model="selected" :headers="headers" :items="files" :pagination.sync="pagination"
                            select-all item-key="filename" class="elevation-1">
                            <template slot="headers" slot-scope="props">
                                <tr>
                                    <th>
                                        <v-checkbox :input-value="props.all" :indeterminate="props.indeterminate"
                                            primary hide-details @click="toggleAll"></v-checkbox>
                                    </th>
                                    <th v-for="header in props.headers" :key="header.text" :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
                                        @click="changeSort(header.value)">
                                        <v-icon small>arrow_upward</v-icon>
                                        {{ header.text }}
                                    </th>
                                </tr>
                            </template>
                            <template slot="items" slot-scope="props">
                                <tr :active="props.selected" @click="props.selected = !props.selected">
                                    <td>
                                        <v-checkbox :input-value="props.selected" primary hide-details></v-checkbox>
                                    </td>
                                    <td class="text-xs-right">{{ props.item.filename }}</td>
                                </tr>
                            </template>
                        </v-data-table>
                    </v-container>
                </v-card>
            </v-flex>

            <v-flex xs4>
                <v-btn class="btn success">Download</v-btn>
                <v-btn class="btn red">Delete</v-btn>
                <v-btn class="btn red">Delete All</v-btn>
            </v-flex>
        </v-layout>
        <br><br><br>
        <v-flex>
            <v-card>
                <v-container>
                    <v-layout>
                        <v-flex xs12>
                            <v-text-field prepend-icon="attach_file" single-line v-model="storagePath" label="storage path"
                                @click.native="onFocus" ref="fileTextField"></v-text-field>
                            <input type="file" :multiple="false" ref="fileInput" @change="onFileChange" webkitdirectory
                                directory>
                        </v-flex>
                        <v-flex xs2>
                            <v-btn style="width: 150px;" @click="save" class="success">Save</v-btn>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card>
        </v-flex>
        <refresh-view :model="refresh" message="Saving data.."></refresh-view>
    </div>

</template>

<script>
    import RefreshView from '../RefreshView'
    export default {
        name: 'analyzer-home-view',
        data: () => ({
            storagePath: '',
            refresh: false,
            pagination: {},
            selected: [],
            headers: [{
                text: 'filename',
                align: 'right',
                value: 'filename'
            }],
            files: [{
                value: false,
                filename: 'readme.txt'
            }, {
                value: false,
                filename: 'bin.exe',
            }]
        }),
        components: {
            RefreshView
        },
        methods: {
            getFormData(files) {
                const data = new FormData();
                [...files].forEach(file => {
                    data.append('data', file, file.path); // currently only one file at a time
                });
                return data;
            },
            onFocus() {
                if (!this.disabled) {
                    debugger;
                    this.$refs.fileInput.click();
                }
            },
            onFileChange($event) {
                const files = $event.target.files || $event.dataTransfer.files;
                const form = this.getFormData(files);
                if (files) {
                    if (files.length > 0) {
                        this.storagePath = [...files].map(file => file.path).join(', ');
                    } else {
                        this.storagePath = null;
                    }
                } else {
                    this.storagePath = $event.target.value.split('\\').pop();
                }
                this.$emit('input', this.storagePath);
                this.$emit('formData', form);
            },
            save() {
                storage.set('analyzer', {
                    path: this.storagePath
                })
                this.refresh = true
            },
            toggleAll() {
                if (this.selected.length) this.selected = []
                else this.selected = this.files.slice()
            },
            changeSort(column) {
                if (this.pagination.sortBy === column) {
                    this.pagination.descending = !this.pagination.descending
                } else {
                    this.pagination.sortBy = column
                    this.pagination.descending = false
                }
            }
        },
        mounted() {
            const vm = this;
            storage.has('analyzer', function (err, hasKey) {
                if (hasKey) {
                    storage.get('analyzer', function (err, analyzer) {
                        vm.storagePath = analyzer.path
                    })
                }
            })
        },
        watch: {
            refresh(val) {
                if (!val) return

                setTimeout(() => {
                    this.refresh = false;
                    window.location.reload()
                    // this.refreshing();
                }, 2000);
            },
        }
    }
</script>

<style>
    .btn {
        width: 300px;
        height: 80px;
        font-size: 15px;
    }

    input[type=file] {
        position: absolute;
        left: -99999px;
    }
</style>