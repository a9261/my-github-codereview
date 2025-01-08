This is my github codereview action

Copy from github action typescript template

You can setting your own parameter in your workflow

      with:
        token: ${{ secrets.token }}
        openaikey: ${{ secrets.openaikey }}
        prompt: ${{ secrets.prompt }}
        commentlng: ${{ secrets.commentlng }}
        programlng: ${{ secrets.programlng }}
        chatgptmodel: ${{ secrets.chatgptmodel }}