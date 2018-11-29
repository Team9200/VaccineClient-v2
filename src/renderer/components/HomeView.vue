<template>
    <v-layout>
        <collector-home-view v-if="mode === 'collector'"></collector-home-view>
        <analyzer-home-view v-if="mode === 'analyzer'"></analyzer-home-view>
        <storage-home-view v-if="mode === 'storage'"></storage-home-view>
    </v-layout>
    <!-- <div style="width: 100%">
        <h1>Home</h1>
        <v-layout>
            <v-btn style="height: 400px; font-size: 25px;" router :to="items[0].to" block color="red" dark>{{ items[0].title }}</v-btn>
            <div style="padding-left: 10px;"></div>
            <v-btn style="height: 400px; font-size: 25px;" router :to="items[1].to" block color="green" dark>Analyzer</v-btn>
            <div style="padding-left: 10px;"></div>
            <v-btn style="height: 400px; font-size: 25px;" router :to="items[2].to" block color="blue" dark>Storage</v-btn>
        </v-layout>
    </div> -->
</template>

<script>
    import CollectorHomeView from './Collector/CollectorHomeView';
    import AnalyzerHomeView from './Analyzer/AnalyzerHomeView';
    import StorageHomeView from './Storage/StorageHomeView';

    export default {
        name: 'home-view',
        data: () => ({
            mode: ''
        }),
        components: {
            CollectorHomeView,
            AnalyzerHomeView,
            StorageHomeView
        },
        created() {
            const vm = this;
            storage.has('mode', function (err, hasKey) {
                if (err) throw err;
                if (hasKey) {
                    storage.get('mode', function (err, data) {
                        if (err) throw err;
                        vm.mode = data.mode;
                    });
                }
            });
        }
    }
</script>
