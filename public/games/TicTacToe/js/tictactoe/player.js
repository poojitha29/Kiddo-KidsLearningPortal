/**
 * Created by madhuajeeth on 12/3/14.
 */

var Player = function(symbol, is_computer){
    symbol = symbol || "x";
    is_computer = is_computer || false;

    this.symbol = symbol;
    this.is_computer = is_computer;
}