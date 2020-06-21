export class DateUtil {
    static now(): number {
        return Math.round((new Date().getTime() / 1000));
    }
}
