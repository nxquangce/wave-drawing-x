import { Options, Vue } from 'vue-class-component';

@Options({
  props: {
    msg: String
  }
})
export default class HeaderTs extends Vue {
  msg!: string
}