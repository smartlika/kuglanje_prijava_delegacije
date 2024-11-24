$(document).ready(function() {
    var leagueButtonsContainer = $('#leagueButtons');
    var matchSelect = $('#matchSelect');
    var domaciButton = $('#domaciButton');
    var gostujuciButton = $('#gostujuciButton');
    var playerList = $('#playerList');
    var selectedPlayerList = $('#selectedPlayerList');
    var delegationList = $('#delegationList');
    var contextMenu = $('#contextMenu');
    var currentPlayerElement;

    lige.forEach(function(liga) {
        var button = $('<div></div>')
            .addClass('league-button')
            .text(liga.naziv)
            .attr('data-league-id', liga.id)
            .click(function() {
                $('.league-button').removeClass('selected');
                $(this).addClass('selected');
                updateMatches(liga.id);
            });
        leagueButtonsContainer.append(button);
    });

    function updateMatches(selectedLeagueId) {
        matchSelect.empty();
        matchSelect.append('<option value="" disabled selected>Odaberite utakmicu</option>');

        var filteredMatches = utakmice.filter(m => m.id_liga === selectedLeagueId);
        filteredMatches.forEach(function(utakmica) {
            var domaciKlub = klubovi.find(k => k.id === utakmica.id_klub_domaci).naziv;
            var gostujuciKlub = klubovi.find(k => k.id === utakmica.id_klub_gosti).naziv;
            var kolo = utakmica.kolo;
            matchSelect.append($('<option></option>')
                .val(utakmica.broj_utakmice)
                .attr('data-home-id', utakmica.id_klub_domaci)
                .attr('data-away-id', utakmica.id_klub_gosti)
                .text(`${kolo}.kolo, br. ${utakmica.broj_utakmice}: ${domaciKlub} - ${gostujuciKlub}`));
        });
    }

    function updateSelectedButton(button) {
        $('.toggle-button').removeClass('selected');
        $(button).addClass('selected');
    }

    function selectDomaciButton() {
        updateSelectedButton(domaciButton);
        updatePlayerList('domaci');
    }

    domaciButton.click(function() {
        selectDomaciButton();
    });

    gostujuciButton.click(function() {
        updateSelectedButton(gostujuciButton);
        updatePlayerList('gostujuci');
    });

    matchSelect.change(function() {
        updatePlayerList(domaciButton.hasClass('selected') ? 'domaci' : 'gostujuci');
    });

    function updatePlayerList(type) {
        var selectedOption = matchSelect.find('option:selected');
        var homeTeamId = parseInt(selectedOption.attr('data-home-id'));
        var awayTeamId = parseInt(selectedOption.attr('data-away-id'));

        var teamId = type === 'domaci' ? homeTeamId : awayTeamId;
        var players = igraci.filter(p => p.id_klub === teamId);

        playerList.empty();

        if (players.length === 0) {
            playerList.append('<div class="player">Nema igrača za odabrani tim.</div>');
        } else {
            players.forEach(function(player) {
                var playerElement = $('<div></div>')
                    .addClass('player clickable')
                    .text(player.ime + " " + player.prezime)
                    .attr('data-player-id', player.ID);
                playerList.append(playerElement);
            });
        }

        enableDoubleClick();
        enableRightClick();
    }

    function enableDoubleClick() {
        $('.clickable').off('dblclick').on('dblclick', function() {
            if ($(this).parent().attr('id') === 'playerList') {
                if ($('#selectedPlayerList .player').length < 10) {
                    $(this).appendTo('#selectedPlayerList');
                    updateSelectedPlayerNumbers();
                } else {
                    alert('Maksimalan broj odabranih igrača je 10.');
                }
            } else {
                $(this).appendTo('#playerList');
                updateSelectedPlayerNumbers();
            }
        });
    }

    function enableRightClick() {
        $('.clickable').off('contextmenu').on('contextmenu', function(e) {
            e.preventDefault();
            currentPlayerElement = $(this);
            contextMenu.css({
                display: 'block',
                left: e.pageX,
                top: e.pageY
            });
        });

        $(document).click(function(e) {
            if (!$(e.target).closest('.context-menu').length) {
                contextMenu.hide();
            }
        });

        $('.context-menu-item').click(function() {
            var role = $(this).attr('data-role');
            addToDelegationList(currentPlayerElement, role);
            contextMenu.hide();
        });
    }

    function addToDelegationList(playerElement, role) {
        var existingRole;

        if (role.startsWith('Sekundant')) {
            // Ako je uloga Sekundant, provjeri za tri različite pozicije
            for (var i = 1; i <= 3; i++) {
                existingRole = delegationList.find('.player[data-role="Sekundant ' + i + '"]');
                if (existingRole.length === 0) {
                    role = 'Sekundant ' + i;
                    break;
                }
            }
        } else {
            // Provjera postoji li već igrač s istom ulogom
            existingRole = delegationList.find('.player[data-role="' + role + '"]');
        }

        if (existingRole.length > 0) {
            // Zamjena postojeće uloge novim igračem
            existingRole.text(role + ": " + playerElement.text())
                .attr('data-player-id', playerElement.attr('data-player-id'));
        } else {
            // Dodavanje nove uloge
            delegationList.append(
                $('<div></div>')
                    .addClass('player clickable')
                    .text(role + ": " + playerElement.text())
                    .attr('data-player-id', playerElement.attr('data-player-id'))
                    .attr('data-role', role)
            );
        }
    }

    function updateSelectedPlayerNumbers() {
        $('#selectedPlayerList .player-number').remove();
        $('#selectedPlayerList .player').each(function(index) {
            $('<div class="player-number">' + (index + 1) + '</div>').insertBefore($(this));
        });
    }

    enableDoubleClick();
    enableRightClick();

    selectDomaciButton();

    $('#printButton').click(function() {
        printContainer2Content();
    });
});

// Funkcionalnost za info button
$('#infoButton').click(function() {
    $('#infoModal').show();
});

// Funkcionalnost za zatvaranje modala
$('.close').click(function() {
    $('#infoModal').hide();
});

// Zatvaranje modala kad korisnik klikne izvan njega
$(window).click(function(event) {
    if ($(event.target).is('#infoModal')) {
        $('#infoModal').hide();
    }
});
