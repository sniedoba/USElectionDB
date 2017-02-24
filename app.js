var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
var express = require('express');
var app = express();

var config = {
    user          : "DBCLASS158",
    password      : "OR4aPkw0",
    connectString : "ginger.umd.edu/dbclass1"
};

app.use("/js", express.static(__dirname + "/app/js"));
app.use("/angular", express.static(__dirname + "/node_modules/angular"));
app.use("/img", express.static(__dirname + "/app/img"));
app.use("/css", express.static(__dirname + "/app/css"));
app.use("/templates", express.static(__dirname + "/app/templates"));

function release(connection) {
  connection.release(function(err) {
    if (err){
      console.log(err.message);
    }
  });
}


/*
 State Stats : States that generated the most elected presidents
*/
app.get('/api/query/stateStats', function(req,res) {
  oracledb.getConnection(
    config,
    function(err, connection)
    {
      if (err) {
        console.log('error establishing connection');
        console.error(err.message);
        return;
      }

      connection.execute(
        "SELECT c.state, count(c.state) as statenum " +
        "FROM candidate c, " +
        "(SELECT distinct cid " +
        "FROM election " +
        "ORDER BY cid) e " +
        "WHERE c.cid = e.cid " +
        "GROUP BY c.state " +
        "ORDER BY statenum desc",
        function(err, result)
        {
          if (err) {
            console.log('error executing query');
            console.error(err.message);
            release(connection);
            return;
          }
          console.log(result);
          res.send(result.rows);
          release(connection);
        });
    });
});

/*
   Champion Political Parties
   Which parties recieved the most votes TOTAL over the course
   of history (by electoral then popular vote
*/
app.get('/api/query/championPoliticalParties', function(req,res) {
  oracledb.getConnection(
    config,
    function(err, connection)
    {
      if (err) {
        console.log('error establishing connection');
        console.error(err.message);
        return;
      }

      connection.execute(
        "select p.pname as PartyName, sum(camp.evotes) as ElectoralVotes, " +
        "sum(camp.nvotes) as PopularVote from campaign camp, party p " +
        "where camp.pid = p.pid group by p.pname " +
        "order by electoralvotes desc, popularvote desc",
        function(err, result)
        {
          if (err) {
            console.log('error executing query');
            console.error(err.message);
            release(connection);
            return;
          }
          console.log(result);
          res.send(result.rows);
          release(connection);
        });
    });
});

/*
  Third Party Stats
  The most popular third most voted for party by given year. What’s the
  highest percentage of votes a 3rd party has ever received? List the parties
  that recieved the 3rd most amount of votes by percentage votes
*/
app.get('/api/query/thirdPartyStats', function(req,res) {
  oracledb.getConnection(
    config,
    function(err, connection)
    {
      if (err) {
        console.log('error establishing connection');
        console.error(err.message);
        return;
      }

      connection.execute(
        "SELECT camp.year, p.pname as PartyName, " +
        "camp.pvotes as PercentVotes FROM Campaign camp, party p " +
        "WHERE 3 = (SELECT count(DISTINCT(camp2.pvotes)) " +
        "FROM Campaign camp2 WHERE camp.pvotes <=camp2.pvotes " +
        "and camp.year = camp2.year) and p.pid = camp.pid " +
        "order by camp.pvotes desc",
        function(err, result)
        {
          if (err) {
            console.log('error executing query');
            console.error(err.message);
            release(connection);
            return;
          }
          console.log(result);
          res.send(result.rows);
          release(connection);
        });
    });
});

/*
 Electoral Upsets : HOW MANY PRESIDENTS WON POPULAR VOTE BUT LOST ELECTORAL VOTE?
 */
app.get('/api/query/electoralUpsets', function(req,res) {
  oracledb.getConnection(
    config,
    function(err, connection)
    {
      if (err) {
        console.log('error establishing connection');
        console.error(err.message);
        return;
      }

      connection.execute(
        "SELECT e.year, c.cname as PresidentElect, c2.cname as RunnerUp, " +
        "(camp.evotes-camp3.evotes) as ElectoralVoteOffset, " +
        "(camp3.nvotes-camp.nvotes) as PopularVoteOffset " +
        "FROM election e, campaign camp, candidate c, " +
        "candidate c2, campaign camp3 " +
        "WHERE camp.year = e.year AND c.cid = e.cid AND camp.cid = e.cid AND " +
        "camp.nvotes < (SELECT max(DISTINCT(camp2.nvotes)) as maxnvote " +
        "FROM Campaign camp2 " +
        "WHERE camp.nvotes <=camp2.nvotes and camp.year = camp2.year) " +
        "AND camp3.year = camp.year AND camp3.nvotes = " +
        "(SELECT max(DISTINCT(camp2.nvotes)) as maxnvote " +
        "FROM Campaign camp2 " +
        "WHERE camp.nvotes <=camp2.nvotes AND camp.year = camp2.year) " +
        "AND camp3.cid = c2.cid AND camp.evotes > camp3.evotes",
        function(err, result)
        {
          if (err) {
            console.log('error executing query');
            console.error(err.message);
            release(connection);
            return;
          }
          console.log(result);
          res.send(result.rows);
          release(connection);
        });
    });
});

/*
  Surprise Victors
  Which candidates were surprise victors (largest difference between final
  polls predicting that the winning candidate would lose and final results)?
*/

app.get('/api/query/surpriseVictors', function(req,res) {
  oracledb.getConnection(
    config,
    function(err, connection)
    {
      if (err) {
        console.log('error establishing connection');
        console.error(err.message);
        return;
      }

      connection.execute(
        "select e.year, c.cname as name, " +
        "round(abs(100*e.polloffset)) as percentOffset " +
        "from election e, candidate c " +
        "where e.polloffset is not null and " +
        "e.cid = c.cid and e.polloffset > 0 " +
        "order by (e.polloffset) desc",
        function(err, result)
        {
          if (err) {
            console.log('error executing query');
            console.error(err.message);
            release(connection);
            return;
          }
          console.log(result);
          res.send(result.rows);
          release(connection);
        });
    });
});

/*
  Biggest Losers

  Top 10 candidates with the most amount of unsuccessful campaigns
  (who also have never won)
*/
app.get('/api/query/biggestLosers', function(req,res) {
  oracledb.getConnection(
    config,
    function(err, connection)
    {
      if (err) {
        console.log('error establishing connection');
        console.error(err.message);
        return;
      }

      connection.execute(
        "select * from (select distinct c.cname as name, " +
        "(select count(*) from campaign camp2 " +
        "where camp2.cid = camp.cid) as NumCampaignsLost " +
        "from candidate c, campaign camp where camp.cid not in " +
        "(select cid from election) and c.cid = camp.cid " +
        "order by NumCampaignsLost desc) tbl where rownum <= 10",
        function(err, result)
        {
          if (err) {
            console.log('error executing query');
            console.error(err.message);
            release(connection);
            return;
          }
          console.log(result);
          res.send(result.rows);
          release(connection);
        });
    });
});

/*
  Most Popular First Name

*/
app.get('/api/query/firstNames', function(req,res) {
  oracledb.getConnection(
    config,
    function(err, connection)
    {
      if (err) {
        console.log('error establishing connection');
        console.error(err.message);
        return;
      }

      connection.execute(
        "SELECT * FROM (SELECT namez.firstname as firstname, " +
        "count(namez.firstname) as count " +
        "FROM (SELECT SUBSTR(c.cname, 1, INSTR(c.cname, ' ')-1) AS FirstName " +
        "FROM candidate c) namez GROUP BY namez.firstname " +
        "ORDER BY count DESC) numnames WHERE ROWNUM <=10",
        function(err, result)
        {
          if (err) {
            console.log('error executing query');
            console.error(err.message);
            release(connection);
            return;
          }
          console.log(result);
          res.send(result.rows);
          release(connection);
        });
    });
});

/*
  Most Popular Last Name

*/
app.get('/api/query/lastNames', function(req,res) {
  oracledb.getConnection(
    config,
    function(err, connection)
    {
      if (err) {
        console.log('error establishing connection');
        console.error(err.message);
        return;
      }

      connection.execute(
        "SELECT * FROM (SELECT namez.LastName as LastName, " +
        "count(namez.LastName) as count " +
        "FROM (SELECT SUBSTR(c.cname, INSTR(c.cname, ' ')+1) AS LastName " +
        "FROM candidate c) namez GROUP BY namez.LastName " +
        "ORDER BY count DESC) numnames WHERE ROWNUM <=10",
        function(err, result)
        {
          if (err) {
            console.log('error executing query');
            console.error(err.message);
            release(connection);
            return;
          }
          console.log(result);
          res.send(result.rows);
          release(connection);
        });
    });
});



/*
  Election Stats By Year

  Typically, we would like to have queries to return information on a given year, such as
candidates, their party affiliation, percentage of votes received, winner, polls prior to the
election etc.

 */
app.get('/api/query/electionStatsByYear', function(req,res) {
  oracledb.getConnection(
    config,
    function(err, connection)
    {
      if (err) {
        console.log('error establishing connection');
        console.error(err.message);
        return;
      }

      connection.execute(
        "SELECT distinct c.cname as Name,  p.pname as Party, camp.EVOTES as ElectoralVotes, " +
        "(SELECT " +
        " case when (camp2.nvotes is not null) " +
        " then cast(camp2.nvotes as varchar(30)) " +
        "else 'N/A' end " +
        "FROM campaign camp2 " +
        " WHERE camp2.year = camp.year and camp2.cid = camp.cid " +
        ") as PopularVote, " +
        "(SELECT " +
        "case when (camp2.pvotes is not null) " +
        "then cast(camp2.pvotes as varchar(30)) " +
        "else 'N/A' end " +
        "FROM campaign camp2 " +
        "WHERE camp2.year = camp.year and camp2.cid = camp.cid " +
        ") as PercentVote, " +
        "(SELECT " +
        "case when count(e2.cid) > 0 " +
        "then 'Won' " +
        "else 'Lost' end " +
        "FROM election e2 " +
        "WHERE e2.cid = c.cid and e2.year = camp.year) as Results "+
        "FROM candidate c, campaign camp, election e, party p " +
        "WHERE c.cid = camp.cid and camp.pid = p.pid and camp.year = :year " +
        "ORDER BY Results desc, camp.evotes desc, PercentVote desc",
        {year: req.query.year},
        function(err, result)
        {
          if (err) {
            console.log('error executing query');
            console.error(err.message);
            release(connection);
            return;
          }
          console.log(result);
          res.send(result.rows);
          release(connection);
        });
    });
});


/*
  Election Stats By Year (Poll Data)

  Typically, we would like to have queries to return information on a given year, such as
candidates, their party affiliation, percentage of votes received, winner, polls prior to the
election etc.

 */
app.get('/api/query/pollData', function(req,res) {
  oracledb.getConnection(
    config,
    function(err, connection)
    {
      if (err) {
        console.log('error establishing connection');
        console.error(err.message);
        return;
      }

      connection.execute(
        "SELECT p.month,  c.cname , p.ppercent " +
        "FROM poll p,candidate c " +
        "WHERE p.year = :year and p.cid = c.cid " +
        "ORDER BY pollid ",
        {year: req.query.year},
        function(err, result)
        {
          if (err) {
            console.log('error executing query');
            console.error(err.message);
            release(connection);
            return;
          }
          console.log(result);
          res.send(result.rows);
          release(connection);
        });
    });
});

/*
  Election Stats by Candidate


*/
app.get('/api/query/statsByCandidate', function(req,res) {
  oracledb.getConnection(
    config,
    function(err, connection)
    {
      if (err) {
        console.log('error establishing connection');
        console.error(err.message);
        return;
      }

      connection.execute(
        "select distinct c.cname as Name, c.cid, camp.year, " +
        "p.pname as Party, camp.EVOTES as ElectoralVotes, " +
        "(select case when (camp2.nvotes is not null) " +
        "then cast(camp2.nvotes as varchar(30)) else 'N/A' end " +
        "FROM campaign camp2 where camp2.year = camp.year and " +
        "camp2.cid = camp.cid) as PopularVote, " +
        "(select case when (camp2.pvotes is not null) " +
        "then cast(camp2.pvotes as varchar(30)) else 'N/A' end " +
        "FROM campaign camp2 where camp2.year = camp.year and " +
        "camp2.cid = camp.cid) as PercentVote, " +
        "(select case when count(e2.cid) > 0 then 'Won' else 'Lost' end " +
        "FROM election e2 WHERE e2.cid = c.cid and " +
        "e2.year = camp.year) as Results " +
        "from candidate c, campaign camp, election e, party p " +
        "where c.cid = camp.cid and camp.pid = p.pid and " +
        "c.cname like :nm || '%' order by camp.year",
        {nm: req.query.name},
        function(err, result)
        {
          if (err) {
            console.log('error executing query');
            console.error(err.message);
            release(connection);
            return;
          }
          console.log(result);
          res.send(result.rows);
          release(connection);
        });
    });
});


/*
  Non-Contiguous Terms

*/
app.get('/api/query/nonContiguous', function(req,res) {
  oracledb.getConnection(
    config,
    function(err, connection)
    {
      if (err) {
        console.log('error establishing connection');
        console.error(err.message);
        return;
      }

      connection.execute(
        "select distinct c.cname as name, " +
        "ranger.min as firstWin, camp.year as yearLostbetween, " +
        "ranger.max as secondwin from election e, election e2, " +
        "candidate c, campaign camp, (select min(e3.year) as min, " +
        "max(e3.year) as max, e3.cid as cid from election e3 " +
        "group by e3.cid) ranger where c.cid = e.cid and " +
        "c.cid = e2.cid and e2.year != e.year and camp.cid = c.cid and " +
        "camp.year > ranger.min and ranger.cid = c.cid and " +
        "camp.year < ranger.max and not exists " +
        "(select * from election where cid = c.cid and year = camp.year)",
        function(err, result)
        {
          if (err) {
            console.log('error executing query');
            console.error(err.message);
            release(connection);
            return;
          }
          console.log(result);
          res.send(result.rows);
          release(connection);
        });
    });
});


/*
  Swing Candidates

*/
app.get('/api/query/swingCandidates', function(req,res) {
  oracledb.getConnection(
    config,
    function(err, connection)
    {
      if (err) {
        console.log('error establishing connection');
        console.error(err.message);
        return;
      }

      connection.execute(
        "select distinct c.cname as Name, camp.year, p.pname as Party, " +
        "camp.EVOTES as ElectoralVotes, (select case " +
        "when (camp2.nvotes is not null) then  " +
        "cast(camp2.nvotes as varchar(30)) else 'N/A' end " +
        "FROM campaign camp2 where camp2.year = camp.year " +
        "and camp2.cid = camp.cid) as PopularVote, " +
        "(select case when (camp2.pvotes is not null) then " +
        "cast(camp2.pvotes as varchar(30)) else 'N/A' end " +
        "FROM campaign camp2 where camp2.year = camp.year and " +
        "camp2.cid = camp.cid) as PercentVote, " +
        "(select case when count(e2.cid) > 0 then 'Won' else 'Lost' end " +
        "FROM election e2 " +
        "WHERE e2.cid = c.cid and e2.year = camp.year) as Results " +
        "from candidate c, campaign camp, election e, party p " +
        "where c.cid = camp.cid and camp.pid = p.pid and " +
        "exists(select distinct c2.cid from candidate c2, party p2, " +
        "campaign camp3, campaign camp4 where camp3.year != camp4.year " +
        "and camp3.cid = c2.cid and camp4.cid = camp3.cid " +
        "and camp3.pid = p2.pid and camp3.pid != camp4.pid and " +
        "c2.cid = c.cid) order by c.cname, camp.year",
        function(err, result)
        {
          if (err) {
            console.log('error executing query');
            console.error(err.message);
            release(connection);
            return;
          }
          console.log(result);
          res.send(result.rows);
          release(connection);
        });
    });
});


/*
  Party history


*/
app.get('/api/query/partyHistory', function(req,res) {
  oracledb.getConnection(
    config,
    function(err, connection)
    {
      if (err) {
        console.log('error establishing connection');
        console.error(err.message);
        return;
      }

      connection.execute(
        "select camp.year as year, c.cname as name, " +
        "(select case when (camp2.pvotes is not null) " +
        "then cast(camp2.pvotes as varchar(30)) else 'N/A' end " +
        "FROM campaign camp2 where camp2.year = camp.year and " +
        "camp2.cid = camp.cid) as PercentVote, " +
        "(select case when (camp2.nvotes is not null) " +
        "then cast(camp2.nvotes as varchar(30)) else 'N/A' end " +
        "FROM campaign camp2 where camp2.year = camp.year and " +
        "camp2.cid = camp.cid) as PopularVote, " +
        "camp.evotes as ElectoralVotes, " +
        "(select case when count(e2.cid) > 0 then 'Won' else 'Lost' end " +
        "FROM election e2 " +
        "WHERE e2.cid = c.cid and e2.year = camp.year) as Results " +
        "from party p, campaign camp, candidate c " +
        "where camp.pid = p.pid and p.pname like :nm || '%' and " +
        "c.cid = camp.cid order by p.pid, camp.year",
        {nm: req.query.name},
        function(err, result)
        {
          if (err) {
            console.log('error executing query');
            console.error(err.message);
            release(connection);
            return;
          }
          console.log(result);
          res.send(result.rows);
          release(connection);
        });
    });
});

/*
  Wins vs Loses (Party history)


*/
app.get('/api/query/winsVsLoses', function(req,res) {
  oracledb.getConnection(
    config,
    function(err, connection)
    {
      if (err) {
        console.log('error establishing connection');
        console.error(err.message);
        return;
      }

      connection.execute(
        "Select won.num as ElectionsWon, " +
        "lose.num as ElectionsLost from(select count(wins.cid) as num " +
        "from (select  camp2.cid from campaign camp2, party p " +
        "where camp2.pid = p.pid and p.pname = 'Republican' and exists( " +
        "select e.year from election e " +
        "where e.year = camp2.year and e.cid = camp2.cid) " +
        ") wins) won, (select count(loss.cid) as num from " +
        "(select  camp3.cid from campaign camp3, party p " +
        "where p.pid = camp3.pid and p.pname like :nm || '%' and " +
        "not exists(select e.year from election e " +
        "where e.year = camp3.year and e.cid = camp3.cid)) loss ) lose",
        {nm: req.query.name},
        function(err, result)
        {
          if (err) {
            console.log('error executing query');
            console.error(err.message);
            release(connection);
            return;
          }
          console.log(result);
          res.send(result.rows);
          release(connection);
        });
    });
});


app.all("/*", function(req,res) {
  res.sendFile("index.html", {root: __dirname + "/app"});
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
