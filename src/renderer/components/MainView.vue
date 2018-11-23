<template>
    <v-layout>
        <v-card>
            <!-- <v-img src="https://cdn.vuetifyjs.com/images/cards/desert.jpg" aspect-ratio="2.75"></v-img> -->
    
            <v-card-title primary-title>
                <div>
                    <!-- <h3 class="headline mb-0">Select Node</h3> -->
                    <div style="padding-top: 10px;">
                        <v-flex>
                            <v-select :key="index" :items="items.title" label="Select node" outline></v-select>
                        </v-flex>
                    </div>
                </div>
            </v-card-title>
    
            <v-card-actions>
                <v-btn flat color="blue">Share</v-btn>
                <v-btn flat color="blue">Explore</v-btn>
            </v-card-actions>
        </v-card>
        <div style="padding-right: 10px;"></div>
        <v-card>
    
            <v-card-title primary-title>
                <div>
                    <h3 class="headline mb-0">Kangaroo Valley Safari</h3>
                    <div>Located two hours south of Sydney in the <br>Southern Highlands of New South Wales, ...</div>
                </div>
            </v-card-title>
    
            <v-card-actions>
                <v-btn flat color="blue">Share</v-btn>
                <v-btn flat color="blue">Explore</v-btn>
            </v-card-actions>
        </v-card>
    </v-layout>
</template>

<script>
    export default {
        name: 'main-view',
        data: () => ({
            clipped: false,
            drawer: false,
            fixed: false,
            items: [{
                    title: 'Collector',
                    action: ''
                },
                {
                    title: 'Analyzer',
                    action: ''
                },
                {
                    title: 'Storage',
                    action: ''
                }
            ]
        })
    }
</script>
