<template>
    <v-card>
        <v-card-text class="pa-0">
            <v-container class="pa-0">
                <div class="layout row ma-0">
                    <div class="flex text-sm-center py-3 white--text" :class="color">
                        <div class="headline">{{ title }}</div>
                        <span class="caption">{{ subTitle }}</span>
                    </div>
                </div>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        name: 'status-component',
        props: {
            icon: String,
            title: String,
            subTitle: String,
            color: String
        }
    };
</script>